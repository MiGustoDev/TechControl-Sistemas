const supabaseUrl = 'https://pjozijojpherwomrktxq.supabase.co';
const supabaseAnonKey = 'sb_publishable_O5RvtBUF43QzfI1Q3ZI7lg_iE9oCNbl';

// We define the users to insert, using the exact IDs the app uses.
const usersToInsert = [
  {
    id: "usr-031",
    username: "facundo.carrizo",
    full_name: "Facundo Carrizo",
    email: "facundocarrizo@migusto.com.ar",
    location: "Sistemas",
    active: true,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z"
  },
  {
    id: "usr-076",
    username: "ramiro.lacci",
    full_name: "Ramiro Lacci",
    email: "ramirolacci@migusto.com.ar",
    location: "Sistemas",
    active: true,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z"
  },
  {
    id: "usr-039",
    username: "gustavo.gonzalez",
    full_name: "Gustavo Gonzalez",
    email: "gustavogonzalez@migusto.com.ar",
    location: "Sistemas",
    active: true,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z"
  }
];

async function seed() {
  console.log("Seeding users in Supabase...");
  for (const user of usersToInsert) {
    const url = `${supabaseUrl}/rest/v1/users`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates' // Upsert behavior
        },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        console.log(`Successfully seeded user ${user.id} (${user.full_name})`);
      } else {
        const text = await response.text();
        console.error(`Failed to seed user ${user.id}: Status ${response.status}`, text);
      }
    } catch (error) {
      console.error(`Fetch error for user ${user.id}:`, error);
    }
  }
}

seed();
