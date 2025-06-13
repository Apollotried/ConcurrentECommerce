import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

// In AuthContext.jsx
export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true); // Add this
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState({ username: '', role: [] });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserProfile({
                    username: decodedToken.sub,
                    role: Array.isArray(decodedToken.authorities)
                        ? decodedToken.authorities
                        : [decodedToken.authorities]
                });
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{
            isLoading,
            isAuthenticated,
            userProfile,
            setIsAuthenticated,
            setUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}