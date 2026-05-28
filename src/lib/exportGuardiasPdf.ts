import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Guardia } from "@/types";
import { getGuardiaTypeShortLabel } from "@/data/guardiaTypes";
import { formatDate, formatToday } from "@/lib/utils-app";

type CollaboratorGroup = {
  userId: string;
  userName: string;
  guardias: Guardia[];
  totalHours: number;
  approvedHours: number;
  pendingHours: number;
  approvedCount: number;
  pendingCount: number;
};

const TABLE_HEAD = [
  "Fecha",
  "Horario",
  "Hs",
  "Tipo",
  "Descripción",
  "Sucursales",
  "Estado",
  "Notas",
];

const TABLE_COLUMN_STYLES = {
  0: { cellWidth: 24 },
  1: { cellWidth: 28 },
  2: { cellWidth: 12, halign: "center" as const },
  3: { cellWidth: 24 },
  4: { cellWidth: 62 },
  5: { cellWidth: 38 },
  6: { cellWidth: 22 },
  7: { cellWidth: 45 },
};

function groupByCollaborator(guardias: Guardia[]): CollaboratorGroup[] {
  const map = new Map<string, CollaboratorGroup>();

  for (const g of guardias) {
    let group = map.get(g.userId);
    if (!group) {
      group = {
        userId: g.userId,
        userName: g.userName,
        guardias: [],
        totalHours: 0,
        approvedHours: 0,
        pendingHours: 0,
        approvedCount: 0,
        pendingCount: 0,
      };
      map.set(g.userId, group);
    }

    group.guardias.push(g);
    group.totalHours += g.hours;
    if (g.status === "approved") {
      group.approvedHours += g.hours;
      group.approvedCount += 1;
    } else {
      group.pendingHours += g.hours;
      group.pendingCount += 1;
    }
  }

  for (const group of map.values()) {
    group.guardias.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  return Array.from(map.values()).sort((a, b) =>
    a.userName.localeCompare(b.userName, "es", { sensitivity: "base" })
  );
}

function guardiaToRow(g: Guardia) {
  return [
    formatDate(g.date),
    `${g.startTime} - ${g.endTime}`,
    g.hours.toFixed(1),
    getGuardiaTypeShortLabel(g.type),
    g.description,
    g.branchesAffected || "N/A",
    g.status === "approved" ? "Aprobado" : "Pendiente",
    g.notes || "",
  ];
}

function formatCollaboratorSummary(group: CollaboratorGroup) {
  return (
    `${group.userName}: ${group.guardias.length} ${group.guardias.length === 1 ? "guardia" : "guardias"} | ` +
    `${group.totalHours.toFixed(1)} hs totales ` +
    `(${group.approvedHours.toFixed(1)} hs aprobadas, ${group.pendingHours.toFixed(1)} hs pendientes)`
  );
}

export function exportGuardiasPdf(guardias: Guardia[]) {
  if (guardias.length === 0) return false;

  const groups = groupByCollaborator(guardias);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const totalHours = guardias.reduce((sum, g) => sum + g.hours, 0);
  const marginLeft = 14;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE OFICIAL DE GUARDIAS IT", marginLeft, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado el: ${formatToday()} — Centro de Operaciones IT`, marginLeft, 23);
  doc.text(
    `Registros: ${guardias.length}  |  Horas totales del equipo: ${totalHours.toFixed(1)} hs`,
    marginLeft,
    29
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen por colaborador:", marginLeft, 36);

  doc.setFont("helvetica", "normal");
  let summaryY = 41;
  for (const group of groups) {
    const lines = doc.splitTextToSize(formatCollaboratorSummary(group), 268);
    doc.text(lines, marginLeft + 2, summaryY);
    summaryY += lines.length * 4.5;
  }

  let cursorY = summaryY + 4;

  for (const group of groups) {
    if (cursorY > 175) {
      doc.addPage();
      cursorY = 16;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(group.userName, marginLeft, cursorY);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${group.guardias.length} ${group.guardias.length === 1 ? "registro" : "registros"} · ${group.totalHours.toFixed(1)} hs`,
      marginLeft,
      cursorY + 5
    );

    autoTable(doc, {
      startY: cursorY + 8,
      head: [TABLE_HEAD],
      body: group.guardias.map(guardiaToRow),
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: TABLE_COLUMN_STYLES,
      margin: { left: marginLeft, right: 14 },
    });

    const tableEnd = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY;
    cursorY = (tableEnd ?? cursorY) + 4;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(241, 245, 249);
    doc.rect(marginLeft, cursorY, 269, 7, "F");
    doc.text(
      `Total ${group.userName}: ${group.totalHours.toFixed(1)} hs — ` +
        `${group.approvedCount} aprobada(s) (${group.approvedHours.toFixed(1)} hs) · ` +
        `${group.pendingCount} pendiente(s) (${group.pendingHours.toFixed(1)} hs)`,
      marginLeft + 2,
      cursorY + 5
    );
    doc.setFont("helvetica", "normal");

    cursorY += 12;
  }

  const fileDate = formatToday().replace(/\//g, "-");
  doc.save(`Reporte_Guardias_IT_${fileDate}.pdf`);
  return true;
}
