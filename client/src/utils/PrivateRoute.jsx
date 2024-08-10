import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ user, children }) => {
    // Check if the user object has a specific property indicating authentication
    if (!user || !user.isAuthenticated) {
        // Redirect to login if the user is not authenticated
        return <Navigate to='/login' replace />;
    }

    // Render the children if the user is authenticated
    return children;
};

export default PrivateRoute;
