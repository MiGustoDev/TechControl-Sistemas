import re

file_path = r'c:\Code\EnProceso\StockControlApp\src\data\mock.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the users array
start_marker = 'export const users: User[] = ['
end_marker = '];'
start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find users array")
    exit(1)

# Find the matching closing bracket for the array
# Since the file is large, we'll find the first ]; after the start_marker
end_idx = content.find(end_marker, start_idx)

users_block = content[start_idx:end_idx + len(end_marker)]

# Split into individual user objects
# This is a bit tricky with regex, but since we know the format...
user_objs = re.findall(r'\{[^{}]*?\}', users_block, re.DOTALL)

cleaned_users = []
rrhh_names = ["Yoselin Piñero", "Elizabeth Colman", "Camila Lescano", "Camila Leguizamon"]

for obj in user_objs:
    # Check if it's a sucursal
    if "Sucursal" in obj or 'location": "Sucursales' in obj:
        continue
        
    new_obj = obj
    # Update RRHH roles
    for name in rrhh_names:
        if name in new_obj:
            new_obj = re.sub(r'"location": ".*?"', '"location": "RRHH"', new_obj)
            break
            
    cleaned_users.append(new_obj)

new_users_block = "export const users: User[] = [\n" + ",\n".join(cleaned_users) + ",\n];"

new_content = content[:start_idx] + new_users_block + content[end_idx + len(end_marker):]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully cleaned users. Removed sucursales and updated RRHH roles.")
