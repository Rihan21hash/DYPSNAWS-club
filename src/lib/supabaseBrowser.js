"use client";

import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client using public keys (read-only via RLS)
// Used for Realtime subscriptions on public-facing pages
const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default supabaseBrowser;
