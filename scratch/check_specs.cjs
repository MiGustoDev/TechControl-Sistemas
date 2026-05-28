const supabaseUrl = 'https://pjozijojpherwomrktxq.supabase.co';
const supabaseAnonKey = 'sb_publishable_O5RvtBUF43QzfI1Q3ZI7lg_iE9oCNbl';

async function check() {
  const ids = ['nb-022', 'nb-023', 'nb-024'];
  try {
    for (const id of ids) {
      const url = `${supabaseUrl}/rest/v1/notebooks?id=eq.${id}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Notebook ${id}:`, JSON.stringify(data[0], null, 2));
      } else {
        console.error(`Failed to fetch ${id}:`, response.status);
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

check();
