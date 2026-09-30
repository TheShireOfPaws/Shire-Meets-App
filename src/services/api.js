import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

export default api;

// Mensaje legible a partir de un error de axios (formato de GlobalExceptionHandler)
export function getErrorMessage(err) {
  if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') {
    return 'The server is taking too long. Try again in a moment.';
  }
  if (err?.request && !err.response) {
    return "Can't connect. Check your internet and try again.";
  }

  const data = err?.response?.data;
  if (Array.isArray(data?.details) && data.details.length > 0) {
    return data.details.join('\n');
  }
  if (data?.message) return data.message;

  return 'Something went wrong. Try again.';
}
