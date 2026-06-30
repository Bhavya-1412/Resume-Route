import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  skills: string[] | null;
  resume_url: string | null;
  created_at: string;
};

export type JobMatch = {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string | null;
  salary: string | null;
  match_score: number;
  job_url: string;
  alerted: boolean;
  created_at: string;
};
