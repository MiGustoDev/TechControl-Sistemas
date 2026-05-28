import type { Guardia } from "@/types";

export type GuardiaType = Guardia["type"];

export const GUARDIA_TYPES: {
  value: GuardiaType;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    value: "soporte",
    label: "Soporte técnico a sucursales",
    shortLabel: "Soporte",
    description: "Redes, equipos, impresoras o caídas operativas en sucursal",
  },
  {
    value: "promocion",
    label: "Promoción especial",
    shortLabel: "Promoción",
    description: "Monitoreo y soporte durante campañas o picos de venta",
  },
  {
    value: "actualizacion",
    label: "Actualización o migración",
    shortLabel: "Actualización",
    description: "Deploys, upgrades de sistemas o cambio de hardware/servidores",
  },
  {
    value: "incidencia",
    label: "Incidencia crítica",
    shortLabel: "Incidencia",
    description: "Intervención urgente ante falla grave de infraestructura",
  },
  {
    value: "otro",
    label: "Otro motivo",
    shortLabel: "Otro",
    description: "Tarea fuera de horario no contemplada en las categorías anteriores",
  },
];

export function getGuardiaTypeMeta(type: string) {
  return GUARDIA_TYPES.find((t) => t.value === type) ?? GUARDIA_TYPES[GUARDIA_TYPES.length - 1];
}

export function getGuardiaTypeShortLabel(type: string) {
  return getGuardiaTypeMeta(type).shortLabel;
}
