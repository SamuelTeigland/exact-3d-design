import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
    const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL; // allow either name for convenience

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) throw new Error("Missing SUPABASE_URL (or VITE_SUPABASE_URL)");
    if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    });
}