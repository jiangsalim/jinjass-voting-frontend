export function formatEAT(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-UG', {
    timeZone: 'Africa/Kampala',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}