/**
 * API 클라이언트 설정
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    '⚠️ VITE_API_BASE_URL is not defined. Using default: http://localhost:5000'
  );
}

console.log(`🌐 API Base URL: ${API_BASE_URL}`);
