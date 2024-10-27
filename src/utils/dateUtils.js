export const parseRelativeTime = (relativeTime, baseDate = new Date()) => {
  const match = relativeTime.match(/^-(\d+)([dMy])$/);
  if (!match) {
    throw new Error(`Invalid relative time format: ${relativeTime}`);
  }

  const [, amount, unit] = match;
  const date = new Date(baseDate);

  switch (unit) {
    case 'd':
      date.setDate(date.getDate() - parseInt(amount));
      break;
    case 'M':
      date.setMonth(date.getMonth() - parseInt(amount));
      break;
    case 'y':
      date.setFullYear(date.getFullYear() - parseInt(amount));
      break;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }

  return date;
};