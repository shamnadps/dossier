// Update an account's pipeline status
query "accounts/{account_id}" verb=PATCH {
  api_group = "App"
  auth = "user"

  input {
    int account_id {
      table = "account"
    }

    enum status {
      values = ["lead", "qualified", "customer", "dormant"]
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

    db.edit account {
      field_name = "id"
      field_value = $input.account_id
      data = {status: $input.status}
    } as $updated
  }

  response = $updated
  tags = ["dossier"]
  guid = "w8LJMFGQecjgxGPfGfnLB099eBI"
}
