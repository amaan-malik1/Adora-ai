import axios from "axios";

// Backend API: production https://adora-ai-backend.onrender.com | local http://localhost:3000
const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
});

export default apiInstance;