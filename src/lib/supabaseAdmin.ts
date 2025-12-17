// src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseTypes";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL ou SERVICE_ROLE_KEY não configurados.");
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

console.log("✅ Supabase Admin client inicializado.");
