export const APP_TIMEZONE = "Asia/Jakarta";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayJakarta(now = new Date()): string {
  return dateFormatter.format(now);
}

export function formatDisplayDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

export function addDays(value: string, amount: number): string {
  const date = new Date(`${value}T12:00:00+07:00`);
  date.setUTCDate(date.getUTCDate() + amount);
  return dateFormatter.format(date);
}

export function differenceInDays(start: string, end: string): number {
  const startTime = Date.parse(`${start}T00:00:00+07:00`);
  const endTime = Date.parse(`${end}T00:00:00+07:00`);
  return Math.max(1, Math.floor((endTime - startTime) / 86_400_000) + 1);
}

export function currentMonthBounds(today = todayJakarta()): { start: string; end: string } {
  const [year, month] = today.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${year}-${String(month).padStart(2, "0")}-${lastDay}`,
  };
}

export function greetingForJakarta(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: APP_TIMEZONE, hour: "2-digit", hour12: false }).format(now),
  );
  if (hour < 11) return "Good morning";
  if (hour < 15) return "Good afternoon";
  if (hour < 18) return "Good evening";
  return "Good night";
}
