interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  RESEND_API_KEY?: string;
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  buyer_type: string | null;
  product: string | null;
  quantity: string | null;
  market: string | null;
  message: string | null;
  source: string;
  status: string;
  created_at: string;
}

interface Followup {
  id: number;
  inquiry_id: number;
  note: string;
  replied_by: string;
  created_at: string;
}
