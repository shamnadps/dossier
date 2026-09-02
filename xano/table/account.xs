// A company being tracked in the sales pipeline
table account {
  auth = false

  schema {
    int id
    timestamp created_at?=now

    // Owning sales rep
    int owner_id {
      table = "user"
    }

    text name filters=trim
    text domain? filters=trim|lower
    text industry? filters=trim

    enum status?=lead {
      values = ["lead", "qualified", "customer", "dormant"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "owner_id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  tags = ["dossier"]
  guid = "8kFpu2f-xYDIZfQbMAcBUWDhPH4"
}
