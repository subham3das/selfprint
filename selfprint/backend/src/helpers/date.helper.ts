export const dateHelper = {
  /**
   * Returns ISO string for current timestamp
   */
  now(): string {
    return new Date().toISOString();
  },

  /**
   * Returns Start and End Date for today in UTC
   */
  getTodayRange(): { start: Date; end: Date } {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
  },

  /**
   * Add days to a given date
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
};

export default dateHelper;
