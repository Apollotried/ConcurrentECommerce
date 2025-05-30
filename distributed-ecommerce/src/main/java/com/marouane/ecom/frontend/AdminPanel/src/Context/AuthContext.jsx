import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState({ username: '', role: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) {
            const decodedToken = jwtDecode(token);
            const username = decodedToken.sub;
            const role = decodedToken.scope;
            setUserProfile({username, role });
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userProfile, setUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
}