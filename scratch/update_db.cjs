const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pjozijojpherwomrktxq.supabase.co';
const supabaseAnonKey = 'sb_publishable_O5RvtBUF43QzfI1Q3ZI7lg_iE9oCNbl';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  console.log("Updating notebooks in Supabase...");
  for (const nb of notebooksToUpdate) {
    const { data, error } = await supabase
      .from('notebooks')
      .update(nb)
      .eq('id', nb.id);
    
    if (error) {
      console.error(`Error updating ${nb.id}:`, error);
    } else {
      console.log(`Successfully updated ${nb.id} to ${nb.brand} ${nb.model}`);
    }
  }
}

update();
