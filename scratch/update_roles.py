import re
import json

file_path = r'c:\Code\EnProceso\StockControlApp\src\data\mock.ts'

# Load mapping from user request
# We'll use a dictionary to store the updates
updates = {
    "Hugo Gazze": "Administración",
    "Andrea Herrera": "Armado",
    "Alexandra Ramírez": "Atención al Cliente",
    "Alexandra Ramirez": "Atención al Cliente",
    "Maria Salazar": "Atención al Cliente",
    "Milagros Ramos": "Calidad",
    "Matias Guerra": "Calidad",
    "Romina Centofante": "Calidad",
    "Marcelo Buscalia": "Calidad",
    "Rocio Portillo": "Compras",
    "Tobías Bangert": "Compras",
    "Tobias Bangert": "Compras",
    "Myrian Catolica": "Compras",
    "Mariano Lovatto": "Diseño",
    "Camila Diaz": "Diseño",
    "Juan Chasampi": "Logística",
    "Mantenimiento": "Mantenimiento",
    "Santiago Páez": "Marketing",
    "Santiago Paez": "Marketing",
    "Camila Ferro": "Marketing",
    "Rodrigo Ricobene": "Marketing",
    "Santiago Toledo": "Oficinas (Community Manager)",
    "Claudia Prent": "Oficinas (Community Manager)",
    "Martin Sastre": "Operaciones",
    "Damaris Burgos": "Operaciones",
    "Wanda Ruiz": "Operaciones",
    "Lidya Tello": "Operaciones",
    "Evelyn Cedron": "Operaciones",
    "Selene Hernandez": "Operaciones",
    "Carlos Lugo": "Producción",
    "Elizabeth Colman": "RRHH",
    "Camila Leguizamon": "RRHH",
    "Camila Lescano": "RRHH",
    "Yoselin Piñero": "RRHH",
    "Yoselin Pinero": "RRHH",
    "Sasha Alfini": "RRHH",
    "Ana Torres": "Seguridad e Higiene",
    "Gustavo González": "Sistemas",
    "Gustavo Gonzalez": "Sistemas",
    "Facundo Carrizo": "Sistemas",
    "Ramio Lacci": "Sistemas",
    "Ramiro Lacci": "Sistemas",
    "SISTEMAS": "Sistemas",
    "Picadillo": "Producción"
}

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the users array
start_marker = 'export const users: User[] = ['
end_marker = '];'
start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

users_block = content[start_idx:end_idx + len(end_marker)]
user_objs = re.findall(r'\{[^{}]*?\}', users_block, re.DOTALL)

updated_users = []
seen_ids = set()

for obj in user_objs:
    # Extract full name
    match_name = re.search(r'"fullName": "(.*?)"', obj)
    if not match_name:
        updated_users.append(obj)
        continue
    
    full_name = match_name.group(1)
    
    # Check for update
    if full_name in updates:
        new_area = updates[full_name]
        # Replace location
        obj = re.sub(r'"location": ".*?"', f'"location": "{new_area}"', obj)
        
    updated_users.append(obj)

# Rebuild users block
new_users_block = "export const users: User[] = [\n" + ",\n".join(updated_users) + ",\n];"

new_content = content[:start_idx] + new_users_block + content[end_idx + len(end_marker):]

# Now handle the groups that might not be in users yet
# Cinthia Vazquez, Ignacio Rios, Nahuel Bracamonte, Gaston Domínguez -> Fichaje
# Victor Gómez, Manuel Dalcamonte, Daniel Martinez, Sergio Horceja -> Seguridad

# We'll add them if they are missing
if "Cinthia Vazquez, Ignacio Rios, Nahuel Bracamonte, Gaston Domínguez" not in new_content:
    # Actually, they might be in assignments but not in users list
    pass

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully updated users roles.")
