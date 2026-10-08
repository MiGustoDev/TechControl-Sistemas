import type { Notebook } from "@/types";
import { notebookStatusLabel, formatToday } from "@/lib/utils-app";

const HEADER_COLOR = "FF1E293B"; // Slate 800
const ALT_ROW_COLOR = "FFF8FAFC";
const BORDER_COLOR = "FFCBD5E1";
const GREEN = "FF059669";

function keysMatch(n: Notebook) {
  const oem = n.productKeyOEM?.trim() || "";
  const inst = n.productKeyInstalled?.trim() || "";
  return !!(oem && inst && oem.toUpperCase() === inst.toUpperCase());
}

export async function exportNotebooksExcel(
  notebooks: Notebook[],
  filterInfo?: { area?: string; search?: string }
) {
  if (notebooks.length === 0) return false;

  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "MG TechOps";
  wb.created = new Date();

  const ws = wb.addWorksheet("Inventario Equipos", {
    pageSetup: { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  const columns = [
    { header: "Código", key: "code", width: 16 },
    { header: "Responsable", key: "user", width: 24 },
    { header: "Área", key: "area", width: 18 },
    { header: "Tipo", key: "type", width: 12 },
    { header: "Marca", key: "brand", width: 16 },
    { header: "Modelo", key: "model", width: 22 },
    { header: "N° Serie", key: "serial", width: 18 },
    { header: "Procesador", key: "cpu", width: 32 },
    { header: "RAM", key: "ram", width: 18 },
    { header: "Almacenamiento", key: "storage", width: 30 },
    { header: "Sistema Operativo", key: "os", width: 24 },
    { header: "Estado", key: "status", width: 14 },
    { header: "Windows Original", key: "original", width: 16 },
    { header: "Clave OEM BIOS", key: "oem", width: 32 },
    { header: "Clave Instalada", key: "inst", width: 32 },
    { header: "Eval. Windows 11", key: "w11", width: 34 },
  ];
  const lastCol = String.fromCharCode(64 + columns.length);

  // Title block
  ws.mergeCells(`A1:${lastCol}1`);
  const title = ws.getCell("A1");
  title.value = "INVENTARIO GENERAL DE EQUIPOS IT";
  title.font = { bold: true, size: 16, color: { argb: HEADER_COLOR } };

  ws.mergeCells(`A2:${lastCol}2`);
  let sub = `Generado el: ${formatToday()} — MG TechOps  |  Total equipos: ${notebooks.length}`;
  if (filterInfo?.area && filterInfo.area !== "all") sub += `  |  Área: ${filterInfo.area.toUpperCase()}`;
  if (filterInfo?.search) sub += `  |  Búsqueda: "${filterInfo.search}"`;
  ws.getCell("A2").value = sub;
  ws.getCell("A2").font = { size: 10, italic: true, color: { argb: "FF475569" } };

  // Header row (row 4)
  const headerRowIdx = 4;
  ws.columns = columns.map((c) => ({ key: c.key, width: c.width }));
  const headerRow = ws.getRow(headerRowIdx);
  columns.forEach((c, i) => (headerRow.getCell(i + 1).value = c.header));
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_COLOR } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = { bottom: { style: "thin", color: { argb: BORDER_COLOR } } };
  });

  const sorted = [...notebooks].sort((a, b) => {
    const aa = (a.currentAssignment?.area || "ZZZ").toLowerCase();
    const bb = (b.currentAssignment?.area || "ZZZ").toLowerCase();
    if (aa !== bb) return aa.localeCompare(bb, "es", { sensitivity: "base" });
    return (a.internalCode || "").localeCompare(b.internalCode || "", "es", { sensitivity: "base" });
  });

  sorted.forEach((n, idx) => {
    const original = keysMatch(n);
    const row = ws.addRow({
      code: n.internalCode || "-",
      user: n.currentAssignment?.userName || "Sin asignar",
      area: n.currentAssignment?.area || "Sin área",
      type: n.category === "desktop" ? "Escritorio" : "Notebook",
      brand: n.brand || "-",
      model: n.model || "-",
      serial: n.serialNumber || "-",
      cpu: n.processor || "-",
      ram: n.ramUsable ? `${n.ram} (${n.ramUsable})` : n.ram || "-",
      storage: n.storage || "-",
      os: n.os || "-",
      status: notebookStatusLabel(n.status),
      original: original ? "✓ Sí" : "",
      oem: n.productKeyOEM || "",
      inst: n.productKeyInstalled || "",
      w11: n.win11Evaluation || "",
    });
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.alignment = { vertical: "middle", wrapText: true, horizontal: col === 13 ? "center" : "left" };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        left: { style: "thin", color: { argb: BORDER_COLOR } },
        right: { style: "thin", color: { argb: BORDER_COLOR } },
      };
      if (idx % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ALT_ROW_COLOR } };
      }
    });
    row.getCell("code").font = { bold: true };
    if (original) row.getCell("original").font = { bold: true, color: { argb: GREEN } };
    row.getCell("oem").font = { name: "Consolas", size: 10 };
    row.getCell("inst").font = { name: "Consolas", size: 10 };
  });

  ws.views = [{ state: "frozen", ySplit: headerRowIdx, xSplit: 1 }];
  ws.autoFilter = { from: { row: headerRowIdx, column: 1 }, to: { row: headerRowIdx, column: columns.length } };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Inventario_Equipos_IT_${formatToday().replace(/\//g, "-")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}
