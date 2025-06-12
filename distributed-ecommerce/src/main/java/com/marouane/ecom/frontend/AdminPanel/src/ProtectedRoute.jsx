    import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
    import {AuthContext} from "./Context/AuthContext.jsx";


    const ProtectedRoute = () => {
        const { isAuthenticated, userProfile, isLoading } = useContext(AuthContext);
        const location = useLocation();

        if (isLoading) {
            return <div>Loading...</div>; // Or a spinner component
        }

        if (!isAuthenticated || !userProfile?.role?.includes("ADMIN")) {
            return <Navigate to="/" replace state={{ from: location }} />;
        }

        return <Outlet />;
    };

export default ProtectedRoute;
