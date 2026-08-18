import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service_role key
// This bypasses RLS and has full database write access
// NEVER expose this client or key to the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export default supabaseAdmin;
