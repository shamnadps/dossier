// A note, task, or logged email against an account
table activity {
  auth = false

  schema {
    int id
    timestamp created_at?=now

    int account_id {
      table = "account"
    }

    enum type?=note {
      values = ["note", "task", "email"]
    }

    text body filters=trim
    timestamp due_at?
    bool done?=false
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "account_id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  tags = ["dossier"]
  guid = "SEG58KDoGkioBS4Gm_qclgDHQjc"
}
