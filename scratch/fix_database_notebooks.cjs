const supabaseUrl = 'https://pjozijojpherwomrktxq.supabase.co';
const supabaseAnonKey = 'sb_publishable_O5RvtBUF43QzfI1Q3ZI7lg_iE9oCNbl';

const notebooksToUpdate = [
  {
    id: "nb-022",
    brand: "Lenovo",
    model: "ThinkBook 16 G7 ARP",
    serial_number: "PW0FQ2EP",
    internal_code: "NTBMGSIS001",
    processor: "AMD Ryzen 7 7735HS with Radeon Graphics",
    ram: "16 Gb",
    storage: "SSD 512GB",
    screen_size: "16.0\"",
    current_assignment: {
      id: "asgn-nb022",
      area: "Sistemas",
      type: "permanent",
      userId: "usr-039",
      userName: "Gustavo Gonzalez",
      assignedAt: "2026-01-05T15:06:00Z",
      notebookId: "nb-022"
    }
  },
  {
    id: "nb-023",
    brand: "Lenovo",
    model: "82TV",
    serial_number: "PF4K4L8L",
    internal_code: "NTBMGSIS002",
    processor: "AMD Ryzen 5 5625U with Radeon Graphics",
    ram: "12 Gb",
    storage: "SSD 256GB",
    screen_size: "15.6\"",
    current_assignment: {
      id: "asgn-nb023",
      area: "Sistemas",
      type: "permanent",
      userId: "usr-031",
      userName: "Facundo Carrizo",
      assignedAt: "2026-01-06T12:08:00Z",
      notebookId: "nb-023"
    }
  },
  {
    id: "nb-024",
    brand: "Lenovo",
    model: "IdeaPad 1 15ALC7",
    serial_number: "PF4ZW1JF",
    internal_code: "NTBMGSIS003",
    processor: "AMD Ryzen 5 5500U with Radeon Graphics",
    ram: "8 GB",
    storage: "SSD 256GB",
    screen_size: "15.6\"",
    current_assignment: {
      id: "asgn-nb024",
      area: "Sistemas",
      type: "permanent",
      userId: "usr-076",
      userName: "Ramiro Lacci",
      assignedAt: "2026-01-05T15:37:00Z",
      notebookId: "nb-024"
    }
  }
];

async function update() {
  console.log("Updating Systems notebooks in Supabase...");
  for (const nb of notebooksToUpdate) {
    const url = `${supabaseUrl}/rest/v1/notebooks?id=eq.${nb.id}`;
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(nb)
      });
      
      if (response.ok) {
        console.log(`Successfully updated ${nb.id} to ${nb.brand} ${nb.model}`);
      } else {
        const text = await response.text();
        console.error(`Failed to update ${nb.id}: Status ${response.status}`, text);
      }
    } catch (error) {
      console.error(`Fetch error for ${nb.id}:`, error);
    }
  }
}

update();
