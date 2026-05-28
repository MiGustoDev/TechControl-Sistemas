const supabaseUrl = 'https://pjozijojpherwomrktxq.supabase.co';
const supabaseAnonKey = 'sb_publishable_O5RvtBUF43QzfI1Q3ZI7lg_iE9oCNbl';

async function check() {
  const url = `${supabaseUrl}/rest/v1/users`;
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
      console.log("Users in DB:");
      data.forEach(u => {
        console.log(`ID: ${u.id}, Username: ${u.username}, FullName: ${u.full_name}`);
      });
    } else {
      console.error("Failed to fetch users:", response.status);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

check();
