const supabaseUrl = 'https://bhbbjvcoujxzqaqjqnti.supabase.co';
const supabaseAnonKey = 'sb_publishable_C_OFBl6KdorQVKjnHFBUyg_DamW_LmK';

const clientInstance = supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: 'sb-cosmos-auth'
    }
});

// Ping keep-alive: despierta Supabase mientras el browser carga los módulos JS
clientInstance.from('carruseles').select('id').limit(1).then(() => { }).catch(() => { });

export { clientInstance as supabase };