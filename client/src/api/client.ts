import axios from "axios";

// Create a configured instance of Axios
const apiClient = axios.create({
  // Point to our Express local backend server
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically inject JWT token into header
apiClient.interceptors.request.use(
  (config) => {
    // Read token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Automatically handle unauthorized errors (401/403)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid or expired, log out the user automatically
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear credentials
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect to login page if we are in the browser
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
