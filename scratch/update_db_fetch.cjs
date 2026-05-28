const supabaseUrl = 'https://pjozijojpherwomrktxq.supabase.co';
const supabaseAnonKey = 'sb_publishable_O5RvtBUF43QzfI1Q3ZI7lg_iE9oCNbl';

const notebooksToUpdate = [
  {
    id: "nb-008",
    brand: "Lenovo",
    model: "ThinkBook 16 G7 ARP",
    serial_number: "MP2PV2G7",
    internal_code: "NTBMGSIS001",
    processor: "AMD Ryzen 7 7735HS with Radeon Graphics",
    ram: "16 Gb",
    storage: "SSD 512GB",
    screen_size: "16.0\""
  },
  {
    id: "nb-009",
    brand: "Lenovo",
    model: "82TV",
    serial_number: "MP2PV2TV",
    internal_code: "NTBMGSIS002",
    processor: "AMD Ryzen 5 5625U with Radeon Graphics",
    ram: "12 Gb",
    storage: "SSD 256GB",
    screen_size: "15.6\""
  },
  {
    id: "nb-010",
    brand: "Lenovo",
    model: "IdeaPad 1 15ALC7",
    serial_number: "MP2PV1LC7",
    internal_code: "NTBMGSIS003",
    processor: "AMD Ryzen 5 5500U with Radeon Graphics",
    ram: "8 GB",
    storage: "SSD 256GB",
    screen_size: "15.6\""
  }
];

async function update() {
  console.log("Updating notebooks via PostgREST Fetch...");
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
