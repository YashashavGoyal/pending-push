import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtect = ({ user, children }) => {
    
    if (!user) {
        return <h1>Loadinng...</h1>
    }
    
    if (!user.isAdmin) {
        // Redirect to login if the user is not authenticated
        // console.log(user.isAdmin);
        return <Navigate to='/feed' replace />;
    }

    // console.log(user.isAdmin);
    
    // Render the children if the user is authenticated
    return children;
};

export default AdminProtect;
