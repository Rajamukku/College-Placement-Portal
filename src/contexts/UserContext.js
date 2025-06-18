import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:5001/api';
const UserContext = createContext();
export const useUsers = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserByToken = useCallback(async (token) => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const role = localStorage.getItem('userRole');
      let endpoint = '';
      
      // --- FIX #1: Logic to handle different roles ---
      if (role === 'student' || role === 'admin') {
        endpoint = '/auth'; // This gets data from the 'users' collection
      } else if (role === 'company') {
        endpoint = '/companies/me'; // This gets data from the 'companies' collection
      }
      
      if (!endpoint) { throw new Error("No valid role found to load user data."); }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Add role to the user object, as it's not stored in the Company model
        setAuthenticatedUser({ ...data, role: role });
      } else {
        localStorage.clear();
        setAuthenticatedUser(null);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.clear();
      setAuthenticatedUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    loadUserByToken(token);
  }, [loadUserByToken]);

  const loginUser = (token) => {
    loadUserByToken(token);
  };

  const logoutUser = () => {
    setAuthenticatedUser(null);
  };
  
  // --- FIX #2: Wrap fetchUsers in useCallback to prevent re-renders ---
  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = (newUser) => setUsers(current => [newUser, ...current]);
  const addJob = (newJob) => setJobs(current => [newJob, ...current]);

  const value = {
    API_URL, users, setUsers, companies, setCompanies, jobs, setJobs, applications,
    setApplications, authenticatedUser, loading, loginUser, logoutUser, addUser, addJob, fetchUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};