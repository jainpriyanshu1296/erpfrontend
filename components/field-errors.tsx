export function FieldErrors({error,field}:{error:unknown;field:string}) {
  const details = error && typeof error==='object' && 'details' in error ? error.details : null;
  const message = details && typeof details==='object' && !Array.isArray(details) ? (details as Record<string,unknown>)[field] : null;
  return typeof message==='string' ? <span role="alert" id={`${field}-error`} className="mt-1 block text-xs text-red-500">{message}</span> : null;
}
