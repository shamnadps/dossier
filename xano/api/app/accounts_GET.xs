// List the authenticated rep's accounts, optionally filtered by status
query accounts verb=GET {
  api_group = "App"
  auth = "user"

  input {
    enum status? {
      values = ["lead", "qualified", "customer", "dormant"]
    }
  }

  stack {
    db.query account {
      where = $db.account.owner_id == $auth.id && $db.account.status ==? $input.status
      sort = {created_at: "desc"}
      return = {type: "list"}
    } as $accounts
  }

  response = $accounts
  tags = ["dossier"]
  guid = "5en8WIJGQBApRjYeXS5necEINWI"
}
