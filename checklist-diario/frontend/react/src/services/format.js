/** "2026-11-25" -> "25/11/2026" (sem passar por Date, para o fuso não mudar o dia). */
export function formatDay(isoDay) {
  const [year, month, day] = isoDay.split("-");
  return `${day}/${month}/${year}`;
}
