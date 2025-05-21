import { supabase } from './supabaseClient';

export async function testSupabaseConnection() {
  const debugInfo: any = {
    authData: null,
    authError: null,
    dbData: {},
    dbErrors: [],
    success: false,
    viteSupabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    viteSupabaseAnonKeyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  try {
    console.log('Testing Supabase connection...');
    
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getUser();
    debugInfo.authData = authData;
    debugInfo.authError = authError;
    console.log('Auth test result:', { authData, authError });

    if (authError) {
      console.error('Authentication error:', authError);
      debugInfo.success = false;
      return debugInfo;
    }
    if (!authData.user) {
      console.warn('No authenticated user found during debug check.');
      // This is not necessarily an error for public pages, but for dashboard it is.
    }

    // Test each table with a simple count query
    const tablesToTest = ['projects', 'avatars', 'voice_overs'];
    let allTableQueriesSuccessful = true;

    for (const tableName of tablesToTest) {
      try {
        console.log(`Querying table: ${tableName}`);
        const { count, error: queryError } = await supabase
          .from(tableName)
          .select('id', { count: 'exact', head: true }); // Changed to select 'id' to ensure column access

        if (queryError) {
          console.error(`Error querying table ${tableName}:`, queryError);
          debugInfo.dbErrors.push({ table: tableName, error: queryError });
          allTableQueriesSuccessful = false;
        } else {
          console.log(`Successfully queried table ${tableName}, count: ${count}`);
          debugInfo.dbData[tableName] = { exists: true, count: count, error: null };
        }
      } catch (err: any) {
        console.error(`Exception querying table ${tableName}:`, err);
        debugInfo.dbErrors.push({ table: tableName, error: { message: err.message, details: err.details, code: err.code } });
        allTableQueriesSuccessful = false;
      }
    }
    
    debugInfo.success = !authError && allTableQueriesSuccessful;

  } catch (error: any) {
    console.error('Supabase connection test failed broadly:', error);
    debugInfo.error = { message: error.message, details: error.details, code: error.code };
    debugInfo.success = false;
  }
  
  console.log('Final debug info:', debugInfo);
  return debugInfo;
}