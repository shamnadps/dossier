// Toggle a task's done state
query "activities/{activity_id}" verb=PATCH {
  api_group = "App"
  auth = "user"

  input {
    int activity_id {
      table = "activity"
    }

    bool done
  }

  stack {
    db.get activity {
      field_name = "id"
      field_value = $input.activity_id
    } as $activity

    precondition ($activity != null) {
      error_type = "notfound"
      error = "Activity not found."
    }

    db.get account {
      field_name = "id"
      field_value = $activity.account_id
    } as $account

    precondition ($account != null && $account.owner_id == $auth.id) {
      error_type = "accessdenied"
      error = "Not your activity."
    }

    db.edit activity {
      field_name = "id"
      field_value = $input.activity_id
      data = {done: $input.done}
    } as $updated
  }

  response = $updated
  tags = ["dossier"]
  guid = "8U7fpWAklqRaiC7y3mWCvAlAFVE"
}
