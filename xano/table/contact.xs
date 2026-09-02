// A person at an account
table contact {
  auth = false

  schema {
    int id
    timestamp created_at?=now

    int account_id {
      table = "account"
    }

    text name filters=trim
    text title? filters=trim
    text email? filters=trim|lower
    text linkedin_url? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "account_id"}]}
  ]

  tags = ["dossier"]
  guid = "PmFoAc1X2jCiiPmvDoVRF5FoMng"
}
