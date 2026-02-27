export function prettyTruncate(
  text: string,
  startChars?: number,
  endChars?: number,
  maxLength?: number,
): string;

export function prettyTruncate(
  text: string,
  length: number,
  position: 'front' | 'mid' | 'back',
): string;

export function prettyTruncate(
  text: string,
  a: number = 4,
  b: number | 'front' | 'mid' | 'back' = 4,
  c: number = 12,
): string {
  if (!text) return '';

  if (typeof b === 'number') {
    const startChars = a;
    const endChars = b;
    const maxLength = c;

    if (text.length <= maxLength) return text;

    const start = text.slice(0, startChars);
    const end = text.slice(-endChars);
    return `${start}...${end}`;
  }

  const length = a;
  const position = b;

  if (text.length <= length) return text;
  if (length <= 0) return '';

  if (position === 'front') {
    return `${text.slice(0, length)}...`;
  }

  if (position === 'back') {
    return `...${text.slice(-length)}`;
  }

  const half = Math.floor((length - 3) / 2);
  const start = text.slice(0, half);
  const end = text.slice(-(length - 3 - half));
  return `${start}...${end}`;
}
