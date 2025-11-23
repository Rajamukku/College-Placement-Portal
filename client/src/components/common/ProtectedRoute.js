// File: client/src/components/common/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    // FIXED: Standardized the localStorage key from 'userToken' to 'token'
    const token = localStorage.getItem('token');
    
    // FIXED: Standardized the localStorage key from 'userRole' to 'userRole'
    // It's better to decode the token to get the role reliably.
    let userRole = null;
    if (token) {
        try {
            // Decode the payload part of the JWT
            const payload = JSON.parse(atob(token.split('.')[1]));
            userRole = payload.user?.role;
        } catch (e) {
            console.error('Failed to decode token:', e);
            // If token is malformed, treat as logged out
            localStorage.removeItem('token');
            return <Navigate to="/login" />;
        }
    }

    if (!token) {
        // If no token, redirect to the main login page
        return <Navigate to="/login" />;
    }

    // If there's a token but the user's role is not in the list of allowed roles, redirect
    if (!allowedRoles.includes(userRole)) {
        // Redirect to a generic login or an unauthorized page
        return <Navigate to="/login" />; 
    }

    // If the token exists and the role is allowed, render the child components
    return <Outlet />;
};

export default ProtectedRoute;