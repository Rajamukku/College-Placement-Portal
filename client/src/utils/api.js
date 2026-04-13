import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject({ message: 'No response from server' });
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

// Auth API methods
export const authAPI = {
  login: (loginData) => api.post('/auth/login', loginData),
  registerStudent: (studentData) => api.post('/auth/register/student', studentData),
  registerCompany: (companyData) => api.post('/auth/register/company', companyData),
  // Add other auth-related API calls here
};

// Student API methods
export const studentAPI = {
  getProfile: () => api.get('/students/me'),
  updateProfile: (profileData) => api.put('/students/profile', profileData),
  // Add other student-related API calls here
};

// Company API methods
export const companyAPI = {
  getProfile: () => api.get('/companies/me'),
  updateProfile: (profileData) => api.put('/companies/profile', profileData),
  // Add other company-related API calls here
};

// Jobs API methods
export const jobsAPI = {
  getAllJobs: () => api.get('/jobs'),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  // Add other job-related API calls here
};

export default api;
