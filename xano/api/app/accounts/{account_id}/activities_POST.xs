// Log a note, task, or email against an account
query "accounts/{account_id}/activities" verb=POST {
  api_group = "App"
  auth = "user"

  input {
    int account_id {
      table = "account"
    }

    enum type {
      values = ["note", "task", "email"]
    }

    text body filters=trim
    timestamp due_at?
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

    db.add activity {
      data = {
        created_at: "now"
        account_id: $input.account_id
        type      : $input.type
        body      : $input.body
        due_at    : $input.due_at
        done      : false
      }
    } as $activity
  }

  response = $activity
  tags = ["dossier"]
  guid = "XUw9pXYbnSTV6PItG9C8UDeX3m4"
}
