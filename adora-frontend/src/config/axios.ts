import axios from "axios";

// Match backend PORT (default 3001 in server.ts; set VITE_BASE_URL if your backend uses another port)
const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
});

export default apiInstance;