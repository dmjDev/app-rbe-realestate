export function normalizeText(text: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    // 0. Eliminar partículas de unión como d' (ej: d'Alcalà -> alcalà)
    .replace(/\b[dl]'|l'|s'/g, "")
    // 1. Eliminar acentos/diacríticos
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // 2. Reemplazar comas, puntos y guiones por espacios
    .replace(/[,.\-]/g, " ")
    // 3. Eliminar espacios dobles creados por el paso anterior
    .replace(/\s+/g, " ")
    .trim();
}