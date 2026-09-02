// The AI-generated account brief. One current brief per account; re-running replaces it.
table brief {
  auth = false

  schema {
    int id
    timestamp generated_at?=now

    int account_id {
      table = "account"
    }

    text summary_md
    text buying_signals_md
    text recommended_action
    text draft_outreach
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "account_id"}]}
    {type: "btree", field: [{name: "generated_at", op: "desc"}]}
  ]

  tags = ["dossier"]
  guid = "D3b4BaNGwcxP2YHq7Ub3Z59sTSY"
}
