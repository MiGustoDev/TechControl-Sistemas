export const HOLIDAYS_2026: Record<string, string> = {
  "2026-01-01": "Año Nuevo",
  "2026-02-16": "Carnaval",
  "2026-02-17": "Carnaval",
  "2026-03-23": "Feriado con fines turísticos",
  "2026-03-24": "Día Nacional de la Memoria por la Verdad y la Justicia",
  "2026-04-02": "Día del Veterano y de los Caídos en la Guerra de Malvinas / Jueves Santo",
  "2026-04-03": "Viernes Santo",
  "2026-05-01": "Día del Trabajador",
  "2026-05-25": "Día de la Revolución de Mayo",
  "2026-06-15": "Paso a la Inmortalidad del Gral. Don Martín Miguel de Güemes",
  "2026-06-20": "Paso a la Inmortalidad del Gral. Manuel Belgrano",
  "2026-07-09": "Día de la Independencia",
  "2026-07-10": "Feriado con fines turísticos",
  "2026-08-17": "Paso a la Inmortalidad del Gral. José de San Martín",
  "2026-10-12": "Día del Respeto a la Diversidad Cultural",
  "2026-11-23": "Día de la Soberanía Nacional",
  "2026-12-07": "Feriado con fines turísticos",
  "2026-12-08": "Inmaculada Concepción de María",
  "2026-12-25": "Navidad"
};

export function getHolidayInfo(dateStr: string): string | null {
  if (HOLIDAYS_2026[dateStr]) {
    return HOLIDAYS_2026[dateStr];
  }
  
  // Fallback genérico para feriados inamovibles si el usuario navega a otro año:
  const monthDay = dateStr.slice(5); // "MM-DD"
  switch (monthDay) {
    case "01-01": return "Año Nuevo";
    case "03-24": return "Día Nacional de la Memoria por la Verdad y la Justicia";
    case "04-02": return "Día del Veterano y de los Caídos en la Guerra de Malvinas";
    case "05-01": return "Día del Trabajador";
    case "05-25": return "Día de la Revolución de Mayo";
    case "06-20": return "Paso a la Inmortalidad del Gral. Manuel Belgrano";
    case "07-09": return "Día de la Independencia";
    case "12-08": return "Inmaculada Concepción de María";
    case "12-25": return "Navidad";
    default: return null;
  }
}
