/**
 * Sube las guardias iniciales a Supabase (lee credenciales de .env).
 * Uso: node scratch/seed_guardias.cjs
 */
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

const guardias = [
  {
    id: "guardia-1",
    date: "2026-05-10",
    start_time: "18:00",
    end_time: "22:00",
    hours: 4,
    user_id: "usr-076",
    user_name: "Ramiro Lacci",
    type: "soporte",
    description: "Soporte fuera de horario por caída de la sucursal San Miguel.",
    branches_affected: "San Miguel",
    status: "approved",
    notes: "Se coordinó con el proveedor de internet y se reinició el router principal de la sucursal.",
    created_at: "2026-05-10T22:15:00Z",
    updated_at: "2026-05-10T22:15:00Z",
  },
  {
    id: "guardia-2",
    date: "2026-05-12",
    start_time: "19:00",
    end_time: "22:00",
    hours: 3,
    user_id: "usr-031",
    user_name: "Facundo Carrizo",
    type: "soporte",
    description: "Reconfiguración de enlace de red y antenas en sucursal Caballito.",
    branches_affected: "Caballito",
    status: "approved",
    notes: "Se restableció el enlace redundante. Pruebas de velocidad correctas.",
    created_at: "2026-05-12T22:10:00Z",
    updated_at: "2026-05-12T22:10:00Z",
  },
  {
    id: "guardia-3",
    date: "2026-05-18",
    start_time: "20:00",
    end_time: "00:30",
    hours: 4.5,
    user_id: "usr-031",
    user_name: "Facundo Carrizo",
    type: "promocion",
    description: "Monitoreo preventivo del flujo de ventas online por promoción especial.",
    branches_affected: "Todas las sucursales",
    status: "approved",
    notes: "Monitoreo de APIs y base de datos durante el pico de transacciones. Sin incidentes.",
    created_at: "2026-05-19T00:45:00Z",
    updated_at: "2026-05-19T00:45:00Z",
  },
  {
    id: "guardia-4",
    date: "2026-05-20",
    start_time: "19:00",
    end_time: "22:00",
    hours: 3,
    user_id: "usr-076",
    user_name: "Ramiro Lacci",
    type: "soporte",
    description: "Actualización de sistema de facturación en sucursal Palermo y Belgrano.",
    branches_affected: "Palermo, Belgrano",
    status: "pending_approval",
    notes: "Se realizó la actualización con éxito. Pruebas de facturación ok.",
    created_at: "2026-05-20T22:10:00Z",
    updated_at: "2026-05-20T22:10:00Z",
  },
  {
    id: "guardia-5",
    date: "2026-05-24",
    start_time: "08:00",
    end_time: "14:00",
    hours: 6,
    user_id: "usr-056",
    user_name: "Mariano Garcia",
    type: "actualizacion",
    description: "Migración de servidor principal de base de datos a nuevo hardware.",
    branches_affected: "Central / Servidores",
    status: "pending_approval",
    notes: "Se realizó backup completo y restauración en el nuevo server. Tiempos de respuesta reducidos a la mitad.",
    created_at: "2026-05-24T14:30:00Z",
    updated_at: "2026-05-24T14:30:00Z",
  },
];

async function main() {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = loadEnv();
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
    console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env");
    process.exit(1);
  }

  const url = `${VITE_SUPABASE_URL}/rest/v1/guardias?on_conflict=id`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(guardias),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Error al subir guardias:", res.status, body);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`OK: ${data.length} guardias en Supabase`);
  data.forEach((g) => console.log(`  - ${g.id} | ${g.date} | ${g.user_name}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
