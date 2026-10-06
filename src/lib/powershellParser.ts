import type { Notebook } from "@/types";

export interface InventoryFileItem {
  name: string;
  text: string;
}

export interface ParsedEquipmentResult {
  equipmentCode: string;
  notebook: Notebook;
  filesProcessed: string[];
  oemKeyFound: boolean;
  installedKeyFound: boolean;
}

/**
 * Splits a CSV line taking into account quoted fields and semicolon delimiters.
 */
function parseCsvLine(line: string, delimiter = ";"): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

/**
 * Extract equipment code prefix from filename, e.g. "NTBMGSIS002_inventario_windows.csv" -> "NTBMGSIS002"
 */
export function extractEquipmentCode(filename: string): string {
  const cleanName = filename.replace(/^.*[\\/]/, ""); // Remove paths
  const parts = cleanName.split("_");
  if (parts.length > 0 && parts[0]) {
    return parts[0].trim().toUpperCase();
  }
  return cleanName.replace(/\.[^/.]+$/, "").toUpperCase();
}

/**
 * Cleans BOM, null bytes (\0) from PowerShell UTF-16 files, and carriage returns.
 */
export function cleanText(rawText: string): string {
  if (!rawText) return "";
  return rawText.replace(/\uFEFF/g, "").replace(/\0/g, "").trim();
}

/**
 * Parses PowerShell text inventory files (claves_windows.txt) for keys and details
 */
export function parseClavesTxt(content: string): Record<string, string> {
  const data: Record<string, string> = {};
  const cleaned = cleanText(content);
  const lines = cleaned.split(/\r?\n/);

  let currentKey = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("=") || line.startsWith("IMPORTANTE:")) {
      currentKey = "";
      continue;
    }

    if (line.endsWith(":")) {
      currentKey = line.slice(0, -1).trim();
    } else if (currentKey) {
      if (!data[currentKey]) {
        data[currentKey] = line;
      }
      currentKey = "";
    } else if (line.includes(": ")) {
      const parts = line.split(": ");
      const k = parts[0].trim();
      const v = parts.slice(1).join(": ").trim();
      if (k && v) {
        data[k] = v;
      }
    }
  }

  return data;
}

/**
 * Parses all uploaded/provided PowerShell files (CSV and TXT) grouped by equipment code.
 */
export function parsePowerShellInventory(files: InventoryFileItem[]): ParsedEquipmentResult[] {
  const grouped: Record<string, { csvFiles: InventoryFileItem[]; txtFiles: InventoryFileItem[] }> = {};

  for (const file of files) {
    const code = extractEquipmentCode(file.name);
    if (!grouped[code]) {
      grouped[code] = { csvFiles: [], txtFiles: [] };
    }
    if (file.name.toLowerCase().endsWith(".csv")) {
      grouped[code].csvFiles.push(file);
    } else {
      grouped[code].txtFiles.push(file);
    }
  }

  const results: ParsedEquipmentResult[] = [];

  for (const [code, group] of Object.entries(grouped)) {
    let csvData: Record<string, string> = {};
    let txtData: Record<string, string> = {};
    const filesProcessed: string[] = [];

    // Process CSV file
    for (const csvFile of group.csvFiles) {
      filesProcessed.push(csvFile.name);
      const cleaned = cleanText(csvFile.text);
      const lines = cleaned.split(/\r?\n/).filter((l) => l.trim() !== "");
      if (lines.length >= 2) {
        const headers = parseCsvLine(lines[0]);
        const values = parseCsvLine(lines[1]);
        headers.forEach((h, idx) => {
          if (h && values[idx] !== undefined) {
            csvData[h] = values[idx];
          }
        });
      }
    }

    // Process TXT files (claves, slmgr, etc.)
    for (const txtFile of group.txtFiles) {
      filesProcessed.push(txtFile.name);
      if (txtFile.name.toLowerCase().includes("claves")) {
        const parsedTxt = parseClavesTxt(txtFile.text);
        txtData = { ...txtData, ...parsedTxt };
      }
    }

    // Determine values
    const internalCode = csvData["Equipo"] || txtData["Equipo"] || code;
    const isDesktop = internalCode.toUpperCase().startsWith("DSK") || (csvData["Modelo"] || "").toUpperCase().includes("H61") || (csvData["Modelo"] || "").toUpperCase().includes("PRIME");
    const category: Notebook["category"] = isDesktop ? "desktop" : "notebook";

    const brand = csvData["Fabricante"] || txtData["Fabricante"] || "Desconocido";
    const model = csvData["Modelo"] || txtData["Modelo"] || "Desconocido";
    const serialNumber = csvData["NumeroSerieEquipo"] || txtData["Numero de serie del equipo"] || "";
    const os = csvData["SistemaOperativo"] || txtData["Sistema operativo"] || "Windows 11";
    const processor = (csvData["Procesador"] || "").trim() || "N/A";
    
    // RAM formatting (supports RAM_Instalada_GB, RAM_Utilizable_GB, Modulos_RAM, RAM_GB)
    const ramInstaladaRaw = csvData["RAM_Instalada_GB"] || "";
    const ramUtilizableRaw = csvData["RAM_Utilizable_GB"] || csvData["RAM_GB"] || "";
    const ramModules = csvData["Modulos_RAM"] || "";
    let ramUsable = "";

    let ram = "N/A";
    if (ramInstaladaRaw) {
      const numInstalada = parseFloat(ramInstaladaRaw.replace(",", "."));
      if (!isNaN(numInstalada)) {
        ram = `${Math.round(numInstalada)} GB`;
      } else {
        ram = `${ramInstaladaRaw} GB`;
      }
      if (ramUtilizableRaw && ramUtilizableRaw !== ramInstaladaRaw) {
        ramUsable = `${ramUtilizableRaw} GB utilizables`;
      }
    } else if (ramUtilizableRaw) {
      const numUtilizable = parseFloat(ramUtilizableRaw.replace(",", "."));
      if (!isNaN(numUtilizable)) {
        ram = `${Math.round(numUtilizable)} GB`;
      } else {
        ram = ramUtilizableRaw;
      }
    }

    // Storage formatting
    const storageRaw = csvData["Discos"] || "SSD/HDD";
    let storage = storageRaw;
    if (storageRaw.includes("|")) {
      const parts = storageRaw.split("|").map(p => p.trim());
      const size = parts[parts.length - 1];
      const modelDrive = parts[0];
      storage = `${modelDrive} (${size})`;
    }

    // Keys
    const productKeyOEM = txtData["Clave OEM original detectada en BIOS/UEFI"] || "";
    const productKeyInstalled = txtData["Clave instalada recuperada desde Windows"] || "";
    const productId = csvData["ProductIDWindows"] || txtData["Product ID de Windows"] || "";
    const activationStatus = csvData["EstadoActivacion"] || txtData["Estado de activacion"] || "Activado";
    const licenseChannel = csvData["CanalLicencia"] || txtData["Canal de licencia"] || "";
    const win11Evaluation = csvData["EvaluacionWindows11"] || "";
    const uuid = csvData["UUIDEquipo"] || txtData["UUID del equipo"] || "";
    const biosVersion = csvData["BIOSVersion"] || "";
    const currentUserLocal = csvData["UsuarioActual"] || txtData["Usuario actual"] || "";
    const coresThreads = csvData["Nucleos"] && csvData["Hilos"] ? `${csvData["Nucleos"]} Núcleos / ${csvData["Hilos"]} Hilos` : undefined;
    
    // TPM Info
    let tpmInfo = "";
    if (csvData["TPM_Presente"]) {
      tpmInfo = `TPM Presente: ${csvData["TPM_Presente"]} | Listo: ${csvData["TPM_Listo"] || "N/A"} ${csvData["TPM_Version"] ? "| Ver: " + csvData["TPM_Version"] : ""}`;
    }

    const nowIso = new Date().toISOString();
    const entryDate = csvData["FechaInventario"] ? csvData["FechaInventario"].split(" ")[0] : nowIso.slice(0, 10);

    const notebook: Notebook = {
      id: `nb-${internalCode.toLowerCase()}`,
      category,
      brand,
      model,
      serialNumber,
      internalCode,
      processor,
      ram,
      storage,
      screenSize: isDesktop ? "N/A" : "15.6\"",
      os,
      physicalCondition: "good",
      functionalStatus: "working",
      status: "in-stock",
      assignmentHistory: [],
      entryDate,
      notes: `Importado automáticamente via PowerShell. Usuario local: ${currentUserLocal}. ${win11Evaluation ? "Eval Win11: " + win11Evaluation : ""}`,
      createdAt: nowIso,
      updatedAt: nowIso,

      // Technical & License fields
      productKeyOEM,
      productKeyInstalled,
      activationStatus,
      licenseChannel,
      productId,
      uuid,
      biosVersion,
      win11Evaluation,
      tpmInfo,
      currentUserLocal,
      coresThreads,
      ramModules,
      ramUsable,
    };

    results.push({
      equipmentCode: internalCode,
      notebook,
      filesProcessed,
      oemKeyFound: Boolean(productKeyOEM && productKeyOEM.length > 10),
      installedKeyFound: Boolean(productKeyInstalled && productKeyInstalled.length > 10),
    });
  }

  return results;
}
