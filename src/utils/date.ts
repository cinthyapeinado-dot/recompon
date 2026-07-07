import type { DayId } from "../types";

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
  key: string;
};

const dayMap: DayId[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

export const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const getDayIdFromDate = (date = new Date()): DayId => dayMap[date.getDay()];

export const formatCalendarDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseCalendarDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

export const shiftMonth = (date: Date, delta: number) =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

export const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric"
  }).format(date);

export const formatHistoryDate = (calendarDate: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short"
  }).format(parseCalendarDate(calendarDate));

export const buildMonthGrid = (monthDate: Date): CalendarCell[] => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -leadingDays);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
      key: formatCalendarDate(date)
    };
  });
};
