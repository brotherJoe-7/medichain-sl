export function formatLeone(value: number | string) {
  const amount = typeof value === 'number'
    ? value
    : Number(String(value).replace(/[^0-9.-]/g, ''));

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return `Le ${amount.toLocaleString('en-US')}`;
}
