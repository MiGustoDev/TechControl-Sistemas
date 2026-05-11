import json

users_raw = """
elizabeth.colman Colman elizabethcolman@migusto.com.ar Oficinas Sí
hurlingham Hurlingham hurlingham@migusto.com.ar Sucursales > Hurlingham Sí
martin.sastre Sastre martinsastre@migusto.com.ar Operaciones Sí
sasha.alfini Alfini sashaalfini@migusto.com.ar Oficinas Sí
yoselin.pinero Piñero yoselinpinero@migusto.com.ar Oficinas Sí
alexandra.ramirez Ramirez alexandraramirez@migusto.com.ar Oficinas Sí
ana.torres Torres Oficinas Sí
ballester Ballester ballester@migusto.com.ar Sucursales > Ballester Sí
balvanera Balvanera balvanera@migusto.com.ar Sucursales > Balvanera Sí
barrancas.belgrano Barrancas de Belgrano barrancas@migusto.com.ar Sucursales > Barrancas de Belgrano Sí
belgrano Belgrano belgrano@migusto.com.ar Sucursales > Belgrano Sí
bella.vista Bella Vista bellavista@migusto.com.ar Sucursales > Bella Vista Sí
camila.diaz Diaz camiladiaz@migusto.com.ar Oficinas Sí
camila.ferro Ferro camilaferro@migusto.com.ar Oficinas Sí
camila.lescano Lescano Oficinas Sí
canitas Canitas canitas@migusto.com.ar Sucursales > Canitas Sí
carla.morelli Morelli Oficinas Sí
carolina.poblete Poblete carolinapoblete@migusto.com.ar Oficinas Sí
cinthia.vazquez Vazquez Planta MG Sí
claudia.prent Prent Oficinas Sí
daniel.peralta Peralta danielperalta@migusto.com.ar Oficinas Sí
delviso Del Viso delviso@migusto.com.ar Sucursales > Del Viso Sí
devoto Devoto devoto@migusto.com.ar Sucursales > Devoto Sí
diego.reyes Reyes diegoreyes@migusto.com.ar Oficinas Sí
don.torcuato Don Torcuato dontorcuato@migusto.com.ar Sucursales > Don Torcuato Sí
eduardo.marra Marra Oficinas Sí
elisa.pereira Pereira Oficinas Sí
emiliano.corbo Corbo Oficinas Sí
eric.martinez Martinez ericmartinez@migusto.com.ar Oficinas Sí
escobar Escobar escobar@migusto.com.ar Sucursales > Escobar Sí
facundo.carrizo Carrizo facundocarrizo@migusto.com.ar Oficinas Sí
florencia.cruz Cruz Oficinas Sí
floresta Floresta floresta@migusto.com.ar Sucursales > Floresta Sí
florida Florida florida@migusto.com.ar Sucursales > Florida Sí
franco.gomez Gomez Oficinas Sí
gaston.dominguez Dominguez Oficinas Sí
gisel.marchetti Marchetti Oficinas Sí
gisella.villarreal Villarreal Oficinas Sí
gustavo.gonzalez Gonzalez Oficinas Sí
hugo.gazze Gazze hugogazze@migusto.com.ar Oficinas Sí
ignacio.rios Rios Oficinas Sí
ituzaingo Ituzaingo ituzaingo@migusto.com.ar Sucursales > Ituzaingo Sí
jose.c.paz Jose C Paz josecpaz@migusto.com.ar Sucursales > Jose C Paz Sí
juan.villafane Villafañe juanvillafane@migusto.com.ar Oficinas Sí
julia.leguizamon Leguizamon Oficinas Sí
julio.cejas Cejas Oficinas Sí
laura.garcia Garcia Oficinas Sí
lidya.tello Tello Operaciones Sí
lucas.barrionuevo Barrionuevo Oficinas Sí
lucia.fernandez Fernandez Oficinas Sí
maira.perez Perez mairaperez@migusto.com.ar Oficinas Sí
manuel.loza Loza Oficinas Sí
marcelo.buscalia Buscalia marcelobuscalia@migusto.com.ar Oficinas Sí
marcos.diaz Diaz Oficinas Sí
maria.jose.rios Rios Oficinas Sí
mariano.garcia Garcia Oficinas Sí
mariano.mancilla Mancilla marianomancilla@migusto.com.ar Oficinas Sí
martinez Martinez martinez@migusto.com.ar Sucursales > Martinez Sí
maschwitz Maschwitz maschwitz@migusto.com.ar Sucursales > Maschwitz Sí
mataderos Mataderos mataderos@migusto.com.ar Sucursales > Mataderos Sí
matias.guerra Guerra Oficinas Sí
merlo Merlo merlo@migusto.com.ar Sucursales > Merlo Sí
milagros.ramos Ramos Oficinas Sí
moreno Moreno moreno@migusto.com.ar Sucursales > Moreno Sí
muniz Muñiz muniz@migusto.com.ar Sucursales > Muñiz Sí
munro Munro munro@migusto.com.ar Sucursales > Munro Sí
nahuel.bracamonte Bracamonte Oficinas Sí
nicolas.villarroel Villarroel Oficinas Sí
pacheco Pacheco pacheco@migusto.com.ar Sucursales > Pacheco Sí
palermo Palermo palermo@migusto.com.ar Sucursales > Palermo Sí
paternal Paternal paternal@migusto.com.ar Sucursales > Paternal Sí
pilar.centro Pilar Centro pilarcentro@migusto.com.ar Sucursales > Pilar Centro Sí
pilar.derqui Pilar Derqui pilarderqui@migusto.com.ar Sucursales > Pilar Derqui Sí
polvorines Polvorines polvorines@migusto.com.ar Sucursales > Polvorines Sí
puerto.madero Puerto Madero puertomadero@migusto.com.ar Sucursales > Puerto Madero Sí
ramiro.lacci Lacci Oficinas Sí
rodrigo.ricobene Ricobene Oficinas Sí
romina.centofante Centofante Oficinas Sí
san.fernando San Fernando sanfernando@migusto.com.ar Sucursales > San Fernando Sí
san.martin San Martin sanmartin@migusto.com.ar Sucursales > San Martin Sí
san.miguel San Miguel sanmiguel@migusto.com.ar Sucursales > San Miguel Sí
santiago.paez Paez santiagopaeztoledo@migusto.com.ar Oficinas Sí
santiago.villordo Villordo Oficinas Sí
sebastian.lorenzo Lorenzo Oficinas Sí
sofia.gonzalez Gonzalez Oficinas Sí
sol.del.valle Del Valle Oficinas Sí
tigre Tigre tigre@migusto.com.ar Sucursales > Tigre Sí
tobias.bangert Bangert Oficinas Sí
valeria.romero Romero Oficinas Sí
vicente.lopez Vicente Lopez vicentelopez@migusto.com.ar Sucursales > Vicente Lopez Sí
victoria.perez Perez Oficinas Sí
villa.adelina Villa Adelina villaadelina@migusto.com.ar Sucursales > Villa Adelina Sí
villa.crespo Villa Crespo villacrespo@migusto.com.ar Sucursales > Villa Crespo Sí
villa.urquiza Villa Urquiza villaurquiza@migusto.com.ar Sucursales > Villa Urquiza Sí
yanina.soto Soto Oficinas Sí
"""

# Image data overrides (from Turn 80)
image_overrides = {
    "hugo.gazze": "Administración",
    "andrea.herrera": "Armado",
    "alexandra.ramirez": "Atención al Cliente",
    "maria.salazar": "Atención al Cliente",
    "milagros.ramos": "Calidad",
    "matias.guerra": "Calidad",
    "romina.centofante": "Calidad",
    "marcelo.buscalia": "Calidad",
    "rocio.portillo": "Compras"
}

# Manual additions from hardware data
hardware_users = [
    {"username": "andrea.herrera", "fullName": "Andrea Herrera", "email": "andreaherrera@migusto.com.ar", "location": "Armado"},
    {"username": "wanda.ruiz", "fullName": "Wanda Ruiz", "email": "wandaruiz@migusto.com.ar", "location": "Operaciones"},
    {"username": "evelyn.cedron", "fullName": "Evelyn Cedron", "email": "evelyncedron@migusto.com.ar", "location": "Operaciones"},
    {"username": "selene.hernandez", "fullName": "Selene Hernandez", "email": "selenehernandez@migusto.com.ar", "location": "Operaciones"},
    {"username": "maria.salazar", "fullName": "Maria Salazar", "email": "mariasalazar@migusto.com.ar", "location": "Atención al Cliente"},
    {"username": "rocio.portillo", "fullName": "Rocio Portillo", "email": "rocioportillo@migusto.com.ar", "location": "Compras"}
]

users = []
lines = [l.strip() for l in users_raw.strip().split('\n')]
for i, line in enumerate(lines):
    parts = line.split()
    if not parts: continue
    
    username = parts[0]
    active = parts[-1] == "Sí"
    
    email = None
    for p in parts:
        if "@" in p:
            email = p
            break
            
    location = "Oficinas"
    if "Sucursales" in line:
        start_idx = line.find("Sucursales")
        location = line[start_idx:-2].strip()
    elif "Operaciones" in line:
        location = "Operaciones"
    elif "Planta MG" in line:
        location = "Planta MG"
        
    # Apply image overrides
    if username in image_overrides:
        location = image_overrides[username]
        
    name_parts = username.split('.')
    fullName = " ".join([p.capitalize() for p in name_parts])
    
    if username == "claudia.prent": fullName = "Claudia Prent"
    if username == "santiago.paez": fullName = "Santiago Toledo"
    
    users.append({
        "id": f"usr-{i+1:03d}",
        "username": username,
        "fullName": fullName,
        "email": email,
        "location": location,
        "active": active,
        "createdAt": "2026-01-01T08:00:00Z",
        "updatedAt": "2026-01-01T08:00:00Z"
    })

# Add missing ones from hardware/image
existing_usernames = {u['username'] for u in users}
for hu in hardware_users:
    if hu['username'] not in existing_usernames:
        users.append({
            "id": f"usr-{len(users)+1:03d}",
            **hu,
            "active": True,
            "createdAt": "2026-01-01T08:00:00Z",
            "updatedAt": "2026-01-01T08:00:00Z"
        })

print("export const users: User[] = [")
for u in users:
    print(f"  {json.dumps(u, indent=2).replace('\"', '\"')},".replace('\n', '\n  '))
print("];")
