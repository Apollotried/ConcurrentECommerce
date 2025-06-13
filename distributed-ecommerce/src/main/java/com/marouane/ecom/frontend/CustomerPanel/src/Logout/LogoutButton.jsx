import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconButton, Tooltip } from '@mui/material';
import { Logout } from '@mui/icons-material';
import {AuthContext} from "../Context/AuthContext.jsx";

const LogoutButton = () => {
    const { setIsAuthenticated, setUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserProfile({ username: '', role: '' });
        navigate('/');
    };

    return (
        <Tooltip title="Logout">
            <IconButton
                size="large"
                color="inherit"
                aria-label="logout"
                onClick={handleLogout}
                sx={{ p: 1 }}
            >
                <Logout fontSize="medium" />
            </IconButton>
        </Tooltip>
    );
};

export default LogoutButton;
