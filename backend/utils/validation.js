const normalizeText = (value, maxLen = 200) => {
  if (value === undefined || value === null) return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
};

const normalizeEmail = (value) => {
  const email = normalizeText(value, 254).toLowerCase();
  return email;
};

const isValidEmail = (value) => {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const parseNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export { normalizeText, normalizeEmail, isValidEmail, parseNumber, parseDate };
