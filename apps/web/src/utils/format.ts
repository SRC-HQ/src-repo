export const prettyTruncate = (
  text: string,
  startChars = 4,
  endChars = 4,
  maxLength = 12,
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const start = text.slice(0, startChars);
  const end = text.slice(-endChars);
  return `${start}...${end}`;
};
