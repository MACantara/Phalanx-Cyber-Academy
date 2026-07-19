const DATE_UPDATED = new Date(2025, 10, 3); // 2025-11-03 (month is 0-indexed)

export function getPolicyDates() {
  const dateUpdated = DATE_UPDATED;
  const dateEffective = new Date(dateUpdated);
  dateEffective.setDate(dateEffective.getDate() + 14);
  return {
    updated: dateUpdated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    effective: dateEffective.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
}
