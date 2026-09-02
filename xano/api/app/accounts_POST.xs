// Create an account from a name and/or a domain
query accounts verb=POST {
  api_group = "App"
  auth = "user"

  input {
    text name? filters=trim
    text domain? filters=trim|lower
  }

  stack {
    precondition ($input.name != null || $input.domain != null) {
      error_type = "inputerror"
      error = "Provide a company name or a domain."
    }

    // Derive a display name from the domain when none was given
    var $name {
      value = $input.name
    }
    conditional {
      if ($name == null || $name == "") {
        var.update $name {
          value = $input.domain|split:"."|first|capitalize
        }
      }
    }

    db.add account {
      data = {
        created_at: "now"
        owner_id  : $auth.id
        name      : $name
        domain    : $input.domain
        status    : "lead"
      }
    } as $account
  }

  response = $account
  tags = ["dossier"]
  guid = "HmuKmc74EMTflYwjsQlaVJCECPU"
}
