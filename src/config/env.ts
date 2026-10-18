export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  appName: import.meta.env.VITE_APP_NAME || 'Fit Web',
  isDev: import.meta.env.DEV,
} as const
