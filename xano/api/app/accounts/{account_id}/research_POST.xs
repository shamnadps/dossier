// Pull live web signals (SerpApi) and generate an AI account brief (Claude).
// Clears any prior signals/brief so a re-run is a clean refresh.
query "accounts/{account_id}/research" verb=POST {
  api_group = "App"
  auth = "user"

  input {
    int account_id {
      table = "account"
    }
  }

  stack {
    db.get account {
      field_name = "id"
      field_value = $input.account_id
    } as $account

    precondition ($account != null && $account.owner_id == $auth.id) {
      error_type = "notfound"
      error = "Account not found."
    }

    // 1. Clear prior research for a clean refresh
    db.query signal {
      where = $db.signal.account_id == $input.account_id
      return = {type: "list"}
    } as $old_signals
    foreach ($old_signals) {
      each as $os {
        db.del signal {
          field_name = "id"
          field_value = $os.id
        }
      }
    }

    db.query brief {
      where = $db.brief.account_id == $input.account_id
      return = {type: "list"}
    } as $old_briefs
    foreach ($old_briefs) {
      each as $ob {
        db.del brief {
          field_name = "id"
          field_value = $ob.id
        }
      }
    }

    // 2. SerpApi - Google News for the company
    api.request {
      url = "https://serpapi.com/search.json"
      method = "GET"
      params = {}
        |set:"engine":"google_news"
        |set:"q":$account.name
        |set:"api_key":$env.SERPAPI_KEY
      headers = []
      timeout = 20
    } as $news_res

    // 3. SerpApi - Google web results for context
    api.request {
      url = "https://serpapi.com/search.json"
      method = "GET"
      params = {}
        |set:"engine":"google"
        |set:"q":($account.name ~ " company")
        |set:"num":5
        |set:"api_key":$env.SERPAPI_KEY
      headers = []
      timeout = 20
    } as $web_res

    var $news_json {
      value = $news_res.response.result|get:"news_results"|json_encode
    }
    var $web_json {
      value = $web_res.response.result|get:"organic_results"|json_encode
    }
    var $kg_json {
      value = $web_res.response.result|get:"knowledge_graph"|json_encode
    }

    // 4. Build the analyst prompt
    var $prompt {
      value = "You are a B2B sales research analyst. Using ONLY the search data below, produce a concise account brief for a salesperson about to reach out.\n\nCompany: " ~ $account.name ~ "\nDomain: " ~ ($account.domain|to_text) ~ "\n\nGOOGLE NEWS RESULTS (JSON):\n" ~ $news_json ~ "\n\nGOOGLE WEB RESULTS (JSON):\n" ~ $web_json ~ "\n\nKNOWLEDGE GRAPH (JSON):\n" ~ $kg_json ~ "\n\nReturn a SINGLE valid JSON object and nothing else, matching exactly:\n{\n  \"industry\": \"short label or null\",\n  \"signals\": [ { \"type\": \"news|hiring|funding|tech|other\", \"headline\": \"one line\", \"url\": \"source url from data or null\", \"source\": \"publication or null\", \"published_at\": \"date string or null\", \"relevance_score\": 0 } ],\n  \"summary_md\": \"2-3 sentences on what the company does and its current moment.\",\n  \"buying_signals_md\": \"2-4 lines starting with '- ', each tied to a signal above; if none, say so plainly.\",\n  \"recommended_action\": \"one specific next step.\",\n  \"draft_outreach\": \"a 90-120 word cold email: first line 'Subject: ...', then the body, referencing a real signal, no bracket placeholders.\"\n}\nRules: 4-8 signals, most relevant first, relevance_score 0-100. Never invent facts, URLs, or numbers not in the data. If data is thin, return fewer signals and say the picture is limited. Output must be strict JSON: no markdown fences, no trailing commas, no text before or after."
    }

    // 5. Gemini - generate the brief as strict JSON
    api.request {
      url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"
      method = "POST"
      params = {
        contents        : [{parts: [{text: $prompt}]}]
        generationConfig: {responseMimeType: "application/json", maxOutputTokens: 8192}
      }
      headers = []
        |push:("x-goog-api-key: " ~ $env.GEMINI_API_KEY)
        |push:"content-type: application/json"
      timeout = 60
    } as $ai_res

    // 6. Parse the model's JSON reply
    var $ai_text {
      value = ""
    }
    try_catch {
      try {
        var.update $ai_text {
          value = $ai_res.response.result|get:"candidates"|first|get:"content"|get:"parts"|first|get:"text"
        }
      }
      catch {
        var.update $ai_text {
          value = ""
        }
      }
    }

    var $out {
      value = null
    }
    try_catch {
      try {
        var.update $out {
          value = $ai_text|json_decode
        }
      }
      catch {
        var.update $out {
          value = null
        }
      }
    }

    precondition ($out != null && $out.summary_md != null) {
      error_type = "inputerror"
      error = "The research model did not return a usable brief. Try again."
    }

    // 7. Backfill industry if we didn't have it
    conditional {
      if (($account.industry == null || $account.industry == "") && $out.industry != null) {
        db.edit account {
          field_name = "id"
          field_value = $input.account_id
          data = {industry: $out.industry}
        } as $account_industry
      }
    }

    // 8. Store signals
    foreach ($out.signals) {
      each as $s {
        db.add signal {
          data = {
            created_at     : "now"
            account_id     : $input.account_id
            type           : $s.type
            headline       : $s.headline
            url            : $s.url
            source         : $s.source
            published_at   : $s.published_at
            relevance_score: $s.relevance_score
          }
        } as $added_signal
      }
    }

    // 9. Store the brief
    db.add brief {
      data = {
        generated_at      : "now"
        account_id        : $input.account_id
        summary_md        : $out.summary_md
        buying_signals_md : $out.buying_signals_md
        recommended_action: $out.recommended_action
        draft_outreach    : $out.draft_outreach
      }
    } as $new_brief

    // 10. Return the refreshed account view
    db.get account {
      field_name = "id"
      field_value = $input.account_id
    } as $account_final

    db.query contact {
      where = $db.contact.account_id == $input.account_id
      sort = {created_at: "asc"}
      return = {type: "list"}
    } as $contacts

    db.query signal {
      where = $db.signal.account_id == $input.account_id
      sort = {relevance_score: "desc"}
      return = {type: "list"}
    } as $signals

    db.query brief {
      where = $db.brief.account_id == $input.account_id
      sort = {generated_at: "desc"}
      return = {type: "single"}
    } as $brief

    db.query activity {
      where = $db.activity.account_id == $input.account_id
      sort = {created_at: "desc"}
      return = {type: "list"}
    } as $activities
  }

  response = {
    id        : $account_final.id
    created_at: $account_final.created_at
    name      : $account_final.name
    domain    : $account_final.domain
    industry  : $account_final.industry
    status    : $account_final.status
    owner_id  : $account_final.owner_id
    contacts  : $contacts
    signals   : $signals
    brief     : $brief
    activities: $activities
  }

  tags = ["dossier"]
  guid = "fnGmricxKVfPXFKvU7kToXteuao"
}
