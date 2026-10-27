/**
 * MCL Ludhiana 48-Working-Hour SLA Engine
 * Standard Timezone: Asia/Kolkata (IST = UTC+05:30)
 * Municipal Office Hours: Monday - Friday, 09:00 - 17:00 IST (8 working hours/day)
 * 48 working hours = 6 full business days
 */

export interface SlaPolicyConfig {
  policyVersion: string;
  startHour: number; // 9 = 09:00 IST
  endHour: number; // 17 = 17:00 IST
  dailyWorkingHours: number; // 8 hours
  workingDays: number[]; // 1 (Mon) to 5 (Fri)
  timezone: string; // 'Asia/Kolkata'
}

export const DEFAULT_SLA_POLICY: SlaPolicyConfig = {
  policyVersion: 'v1.0',
  startHour: 9,
  endHour: 17,
  dailyWorkingHours: 8,
  workingDays: [1, 2, 3, 4, 5],
  timezone: 'Asia/Kolkata',
};

// Punjab State Government & MCL Official Gazetted Holidays for 2026 (YYYY-MM-DD)
export const GAZETTED_HOLIDAYS_2026: Set<string> = new Set([
  '2026-01-26', // Republic Day
  '2026-02-01', // Guru Ravidas Jayanti
  '2026-02-15', // Maha Shivratri
  '2026-03-04', // Holi
  '2026-03-20', // Id-ul-Fitr
  '2026-03-27', // Ram Navami
  '2026-04-13', // Baisakhi
  '2026-04-14', // Dr. B.R. Ambedkar Jayanti
  '2026-04-03', // Good Friday
  '2026-05-01', // May Day
  '2026-08-15', // Independence Day
  '2026-10-02', // Mahatma Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-10-25', // Maharishi Valmiki Jayanti
  '2026-11-08', // Diwali
  '2026-11-24', // Guru Nanak Dev Ji Parkash Purab
  '2026-12-25', // Christmas Day
]);

/**
 * Converts a UTC Date into IST components (year, month, day, dayOfWeek, hour, minute)
 */
function getIstComponents(date: Date) {
  // IST is UTC + 5h30m (330 minutes)
  const istOffsetMs = 330 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffsetMs);

  const year = istDate.getUTCFullYear();
  const month = istDate.getUTCMonth(); // 0-indexed
  const day = istDate.getUTCDate();
  const dayOfWeek = istDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = istDate.getUTCHours();
  const minute = istDate.getUTCMinutes();
  const second = istDate.getUTCSeconds();
  const ms = istDate.getUTCMilliseconds();

  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return { year, month, day, dayOfWeek, hour, minute, second, ms, dateString };
}

/**
 * Creates a UTC Date from IST calendar components
 */
function createDateFromIst(year: number, month: number, day: number, hour: number, minute: number = 0, second: number = 0): Date {
  const istOffsetMs = 330 * 60 * 1000;
  // Construct UTC timestamp representing that exact IST moment
  const naiveUtc = Date.UTC(year, month, day, hour, minute, second);
  return new Date(naiveUtc - istOffsetMs);
}

/**
 * Checks whether an IST calendar date is an official working day
 */
export function isWorkingDay(date: Date, holidays: Set<string> = GAZETTED_HOLIDAYS_2026): boolean {
  const { dayOfWeek, dateString } = getIstComponents(date);
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false; // Weekend
  }
  if (holidays.has(dateString)) {
    return false; // Gazetted Holiday
  }
  return true;
}

/**
 * Calculates due date given a start time and required working hours (default 48 working hours = 6 working days)
 */
export function calculateWorkingHourDeadline(
  startAt: Date | string,
  workingHoursNeeded: number = 48,
  config: SlaPolicyConfig = DEFAULT_SLA_POLICY,
  holidays: Set<string> = GAZETTED_HOLIDAYS_2026
): Date {
  let current = typeof startAt === 'string' ? new Date(startAt) : new Date(startAt.getTime());
  let remainingHours = workingHoursNeeded;

  while (remainingHours > 0) {
    const ist = getIstComponents(current);

    // If today is not a working day (weekend or holiday), jump to next day 09:00 IST
    if (!isWorkingDay(current, holidays)) {
      current = createDateFromIst(ist.year, ist.month, ist.day + 1, config.startHour, 0);
      continue;
    }

    // If before working hours (e.g. before 09:00 IST), snap to 09:00 IST today
    if (ist.hour < config.startHour) {
      current = createDateFromIst(ist.year, ist.month, ist.day, config.startHour, 0);
      continue;
    }

    // If after working hours (at or after 17:00 IST), jump to next day 09:00 IST
    if (ist.hour >= config.endHour) {
      current = createDateFromIst(ist.year, ist.month, ist.day + 1, config.startHour, 0);
      continue;
    }

    // We are currently in active working hours.
    // Calculate hours remaining in today's window:
    const remainingTodayMs =
      createDateFromIst(ist.year, ist.month, ist.day, config.endHour, 0).getTime() - current.getTime();
    const remainingTodayHours = remainingTodayMs / (3600 * 1000);

    if (remainingHours <= remainingTodayHours) {
      // Remaining hours fit entirely within today's window!
      current = new Date(current.getTime() + remainingHours * 3600 * 1000);
      remainingHours = 0;
    } else {
      // Consume all hours remaining today and jump to next morning 09:00 IST
      remainingHours -= remainingTodayHours;
      current = createDateFromIst(ist.year, ist.month, ist.day + 1, config.startHour, 0);
    }
  }

  return current;
}

/**
 * Checks if a complaint's SLA has been breached considering current pause state
 */
export function isSlaBreached(
  status: string,
  dueAt: Date | string,
  isPaused: boolean = false,
  totalPausedMinutes: number = 0
): boolean {
  if (status === 'CLOSED' || status === 'RESOLUTION_SUBMITTED') {
    return false;
  }

  const now = Date.now();
  const adjustedDueMs = new Date(dueAt).getTime() + totalPausedMinutes * 60 * 1000;

  if (isPaused) {
    // If currently paused, SLA clock is frozen
    return false;
  }

  return now > adjustedDueMs;
}

