const supabaseUrl = 'https://pjozijojpherwomrktxq.supabase.co';
const supabaseAnonKey = 'sb_publishable_O5RvtBUF43QzfI1Q3ZI7lg_iE9oCNbl';

async function check() {
  const url = `${supabaseUrl}/rest/v1/notebooks`;
  try {
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
      console.log("Notebooks in DB:");
      data.forEach(n => {
        console.log(`ID: ${n.id}, Code: ${n.internal_code}, Brand: ${n.brand}, Assignment:`, n.current_assignment);
      });
    } else {
      console.error("Failed to fetch notebooks:", response.status);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

check();
