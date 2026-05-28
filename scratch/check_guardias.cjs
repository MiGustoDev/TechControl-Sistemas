const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

async function check() {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = loadEnv();
  const headers = {
    apikey: VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };

  const getRes = await fetch(`${VITE_SUPABASE_URL}/rest/v1/guardias?select=id,date,user_name,status`, {
    headers: { ...headers, Prefer: "count=exact" },
  });

  const range = getRes.headers.get("content-range");
  const total = range ? range.split("/")[1] : "?";
  console.log(`GET guardias: HTTP ${getRes.status} — registros: ${total}`);

  if (getRes.ok) {
    const data = await getRes.json();
    data.forEach((g) => console.log(`  - ${g.id} | ${g.date} | ${g.user_name} | ${g.status}`));
  } else {
    console.error(await getRes.text());
  }

  const probe = {
    id: "__probe_rls__",
    date: "2099-01-01",
    start_time: "00:00",
    end_time: "01:00",
    hours: 1,
    user_id: "usr-probe",
    user_name: "Probe",
    type: "otro",
    description: "RLS probe",
    branches_affected: "",
    status: "approved",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const postRes = await fetch(`${VITE_SUPABASE_URL}/rest/v1/guardias`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(probe),
  });
  console.log(`POST prueba escritura: HTTP ${postRes.status}`);
  if (!postRes.ok) {
    console.error(await postRes.text());
    console.log("\n→ Ejecutá scratch/supabase_guardias_setup.sql en el SQL Editor de Supabase.");
  } else {
    await fetch(`${VITE_SUPABASE_URL}/rest/v1/guardias?id=eq.__probe_rls__`, {
      method: "DELETE",
      headers,
    });
    console.log("Escritura OK (registro de prueba eliminado).");
  }
}

check().catch(console.error);
