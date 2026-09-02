// Full account view: account + contacts + signals + latest brief + activities
query "accounts/{account_id}" verb=GET {
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
    id        : $account.id
    created_at: $account.created_at
    name      : $account.name
    domain    : $account.domain
    industry  : $account.industry
    status    : $account.status
    owner_id  : $account.owner_id
    contacts  : $contacts
    signals   : $signals
    brief     : $brief
    activities: $activities
  }

  tags = ["dossier"]
  guid = "oQtFVzERuckTy6K2uZJd2WpZsZQ"
}
