// API Base URL - Will be used to connect to the backend API
// In production, this will be automatically set to the correct URL by Railway
// For local development, this should point to your local backend server

// Determine the API URL based on environment
let apiBaseUrl = '';

if (process.env.NODE_ENV === 'production') {
  // For production deployment on Railway
  // This assumes the backend is deployed on the same domain
  apiBaseUrl = window.location.origin;
} else {
  // For local development
  apiBaseUrl = 'http://localhost:3001';
}

export const API_BASE_URL = apiBaseUrl;

// Other configuration settings
export const APP_NAME = 'TSB Platform';
export const COPYRIGHT_YEAR = new Date().getFullYear();

// Authentication settings
export const AUTH_TOKEN_KEY = 'token';
export const AUTH_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

// Feature flags
export const FEATURES = {
  LIVE_STREAMING: true,
  AR_EXPERIENCE: true,
  BATTLE_SANDBOX: true,
  TEAM_ANALYTICS: true,
};

// Default settings
export const DEFAULTS = {
  THEME: 'light',
  LANGUAGE: 'zh-CN',
  SIDEBAR_COLLAPSED: false,
};
