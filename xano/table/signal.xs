// A time-sensitive fact about an account, pulled from live web search
table signal {
  auth = false

  schema {
    int id
    timestamp created_at?=now

    int account_id {
      table = "account"
    }

    enum type?=other {
      values = ["news", "hiring", "funding", "tech", "other"]
    }

    text headline filters=trim
    text url? filters=trim
    text source? filters=trim
    text published_at? filters=trim

    // 0-100, assigned by the model
    int relevance_score?=0
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "account_id"}]}
  ]

  tags = ["dossier"]
  guid = "DD1d5rqjzxp5AFOYzeO-sMVp5fg"
}
