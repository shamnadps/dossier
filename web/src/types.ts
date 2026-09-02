export type AccountStatus = "lead" | "qualified" | "customer" | "dormant";

export interface Account {
  id: number;
  created_at: number;
  name: string;
  domain: string | null;
  industry: string | null;
  status: AccountStatus;
  owner_id: number;
}

export interface Contact {
  id: number;
  account_id: number;
  name: string;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
}

export type SignalType = "news" | "hiring" | "funding" | "tech" | "other";

export interface Signal {
  id: number;
  account_id: number;
  type: SignalType;
  headline: string;
  url: string | null;
  source: string | null;
  published_at: string | null;
  relevance_score: number;
}

export interface Brief {
  id: number;
  account_id: number;
  generated_at: number;
  summary_md: string;
  buying_signals_md: string;
  recommended_action: string;
  draft_outreach: string;
}

export type ActivityType = "note" | "task" | "email";

export interface Activity {
  id: number;
  created_at: number;
  account_id: number;
  type: ActivityType;
  body: string;
  due_at: number | null;
  done: boolean;
}

export interface AccountDetail extends Account {
  contacts: Contact[];
  signals: Signal[];
  brief: Brief | null;
  activities: Activity[];
}

export interface AuthResponse {
  authToken: string;
}
