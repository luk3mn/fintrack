const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const time = (date: Date) =>
  date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function relativeSyncLabel(date?: Date) {
  if (!date || !isValidDate(date)) return "Nunca sincronizado";

  const elapsed = Date.now() - date.getTime();

  if (elapsed < MINUTE) return "Atualizado agora";
  if (elapsed < HOUR) {
    return `Atualizado há ${Math.floor(elapsed / MINUTE)} min`;
  }
  if (elapsed < DAY) {
    return `Atualizado há ${Math.floor(elapsed / HOUR)} h`;
  }

  return `Atualizado há ${Math.floor(elapsed / DAY)} d`;
}

export function connectionUpdatedLabel(date?: Date) {
  if (!date || !isValidDate(date)) return "Nunca atualizado";

  const today = new Date();
  if (sameDay(date, today)) return `Atualizado hoje, ${time(date)}`;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, yesterday)) return `Atualizado ontem, ${time(date)}`;

  return `Atualizado em ${date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })}, ${time(date)}`;
}
