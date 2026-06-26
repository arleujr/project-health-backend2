const DEFAULT_BACKEND_URL =
  'https://project-health-backend.onrender.com';

export function getBackendUrl(): string {
  const configuredUrl = process.env.BACKEND_URL?.trim();

  const backendUrl = configuredUrl || DEFAULT_BACKEND_URL;

  return backendUrl.replace(/\/+$/, '');
}