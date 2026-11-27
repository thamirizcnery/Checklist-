// "Hoje" é sempre o dia em Brasília, não o do navegador nem o do servidor (que roda em UTC).
const TIME_ZONE = 'America/Sao_Paulo';

export type Clock = () => Date;

export const systemClock: Clock = () => new Date();

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Dia civil em Brasília, no formato AAAA-MM-DD. */
export const dayInSaoPaulo = (instant: Date): string => formatter.format(instant);

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isValidDay = (value: string): boolean => {
  if (!DAY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const addDays = (day: string, amount: number): string => {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
};

/** Quantidade de dias de `from` até `to`, contando os dois (from <= to). */
export const daysBetweenInclusive = (from: string, to: string): number => {
  const ms = new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000) + 1;
};
