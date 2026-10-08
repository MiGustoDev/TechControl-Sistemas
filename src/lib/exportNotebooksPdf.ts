import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Notebook } from "@/types";
import { notebookStatusLabel, formatToday } from "@/lib/utils-app";

const TABLE_HEAD = [
  "Código / Responsable",
  "Tipo",
  "Marca y Modelo",
  "N° Serie",
  "Especificaciones",
  "Área / Destino",
  "Estado",
  "Licencias Windows",
];

const TABLE_COLUMN_STYLES = {
  0: { cellWidth: 32, fontStyle: "bold" as const }, // Código / Responsable
  1: { cellWidth: 20 },                             // Tipo
  2: { cellWidth: 34 },                             // Marca y Modelo
  3: { cellWidth: 28 },                             // N° Serie
  4: { cellWidth: 50 },                             // Especificaciones
  5: { cellWidth: 30 },                             // Área / Destino
  6: { cellWidth: 20 },                             // Estado
  7: { cellWidth: 55 },                             // Licencias Windows
};

function notebookToRow(n: Notebook) {
  const specs = [
    n.processor,
    n.ramUsable ? `RAM: ${n.ram} (${n.ramUsable})` : (n.ram ? `RAM: ${n.ram}` : ""),
    n.storage,
    n.os ? `SO: ${n.os}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const codeAndUser = n.currentAssignment?.userName
    ? `${n.internalCode || "-"}\n${n.currentAssignment.userName}`
    : (n.internalCode || "-");

  const assignmentArea = n.currentAssignment
    ? `${n.currentAssignment.area || "Sin área"}${n.currentAssignment.type === "loan" ? " (Préstamo)" : ""}`
    : "Sin área";

  const oemKey = n.productKeyOEM?.trim() || "";
  const instKey = n.productKeyInstalled?.trim() || "";
  const keysMatch = !!(oemKey && instKey && oemKey.toUpperCase() === instKey.toUpperCase());

  const keyLines: string[] = [];
  if (keysMatch) {
    keyLines.push("[✓ Windows Original]");
  }
  if (oemKey) {
    keyLines.push(`OEM: ${oemKey}`);
  }
  if (instKey) {
    keyLines.push(`Inst: ${instKey}`);
  }
  if (!oemKey && !instKey && n.productId) {
    keyLines.push(`ID: ${n.productId}`);
  }

  const licenseKeyText = keyLines.length > 0 ? keyLines.join("\n") : "-";

  return [
    codeAndUser,
    n.category === "desktop" ? "Escritorio" : "Notebook",
    `${n.brand} ${n.model}`.trim(),
    n.serialNumber || "-",
    specs || "-",
    assignmentArea,
    notebookStatusLabel(n.status),
    licenseKeyText,
  ];
}

export function exportNotebooksPdf(
  notebooks: Notebook[],
  filterInfo?: { area?: string; status?: string; search?: string },
  action: "download" | "print" = "download"
) {
  if (notebooks.length === 0) return false;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const marginLeft = 14;

  // Header Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INVENTARIO GENERAL DE EQUIPOS IT", marginLeft, 16);

  // Subtitle & Metadata
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado el: ${formatToday()} — Centro de Operaciones IT / MG TechOps`, marginLeft, 22);

  // Summary counts
  const totalCount = notebooks.length;
  const notebookCount = notebooks.filter((n) => n.category === "notebook").length;
  const desktopCount = notebooks.filter((n) => n.category === "desktop").length;

  const inUseCount = notebooks.filter((n) => n.status === "in-use").length;
  const inStockCount = notebooks.filter((n) => n.status === "in-stock").length;
  const loanedCount = notebooks.filter((n) => n.status === "loaned").length;
  const inRepairCount = notebooks.filter((n) => n.status === "in-repair").length;
  const decommissionedCount = notebooks.filter((n) => n.status === "decommissioned").length;

  let subtitleText = `Total equipos: ${totalCount} (${notebookCount} Notebooks, ${desktopCount} Desktops)`;
  if (filterInfo?.area && filterInfo.area !== "all") {
    subtitleText += ` | Área: ${filterInfo.area.toUpperCase()}`;
  }
  if (filterInfo?.search) {
    subtitleText += ` | Búsqueda: "${filterInfo.search}"`;
  }
  doc.setFont("helvetica", "bold");
  doc.text(subtitleText, marginLeft, 27);

  // Status Summary Bar
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const summaryStatus = `En Uso: ${inUseCount} | En Stock: ${inStockCount} | Prestadas: ${loanedCount} | En Reparación: ${inRepairCount} | Dadas de Baja: ${decommissionedCount}`;
  doc.text(summaryStatus, marginLeft, 32);

  const startY = 36;

  // Sort notebooks by area alphabetically for grouped ordering
  const sortedNotebooks = [...notebooks].sort((a, b) => {
    const areaA = (a.currentAssignment?.area || "ZZZ_SinArea").toLowerCase();
    const areaB = (b.currentAssignment?.area || "ZZZ_SinArea").toLowerCase();
    if (areaA !== areaB) {
      return areaA.localeCompare(areaB, "es", { sensitivity: "base" });
    }
    return (a.internalCode || "").localeCompare(b.internalCode || "", "es", { sensitivity: "base" });
  });

  autoTable(doc, {
    startY: startY,
    head: [TABLE_HEAD],
    body: sortedNotebooks.map(notebookToRow),
    rowPageBreak: "avoid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: TABLE_COLUMN_STYLES,
    margin: { left: marginLeft, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 8
      );
      doc.setTextColor(0);
    },
  });

  if (action === "print") {
    doc.autoPrint();
    const blobUrl = String(doc.output("bloburl"));
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Error al imprimir PDF de equipos:", err);
      }
    };
    return true;
  }

  const fileDate = formatToday().replace(/\//g, "-");
  doc.save(`Inventario_Equipos_IT_${fileDate}.pdf`);
  return true;
}
