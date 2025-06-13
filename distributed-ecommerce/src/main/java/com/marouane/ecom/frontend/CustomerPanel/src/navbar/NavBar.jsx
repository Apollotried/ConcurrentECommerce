import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Box,
    styled
} from '@mui/material';
import {
    ShoppingCart,
    Notifications,
    AccountCircle,
    Login, Logout
} from '@mui/icons-material';

import { Link } from 'react-router-dom';
import LogoutButton from "../Logout/LogoutButton.jsx";


// Styled components for the navbar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[3],
    marginBottom: theme.spacing(4)
}));

const NavTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    letterSpacing: 1,
    [theme.breakpoints.up('sm')]: {
        fontSize: '1.3rem'
    }
}));

const ActionIcons = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
        gap: theme.spacing(2)
    }
}));

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    return (
        <StyledAppBar position="static">
            <Toolbar>
                {/* Left side - Brand/Logo */}
                <NavTitle
                    variant="h6"
                    component={Link}
                    to="/products"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit'
                    }}
                >
                    E-Commerce Store
                </NavTitle>

                {/* Right side - Action Icons */}
                <ActionIcons>
                    {/* Notification Icon */}
                    <IconButton
                        size="large"
                        color="inherit"
                        aria-label="notifications"
                        sx={{ p: 1 }}
                    >
                        <Badge badgeContent={0} color="error">
                            <Notifications fontSize="medium" />
                        </Badge>
                    </IconButton>

                    {/* Cart Icon */}
                    <IconButton
                        component={Link}
                        to="/cart"
                        size="large"
                        color="inherit"
                        aria-label="cart"
                        sx={{ p: 1 }}
                    >
                        <Badge badgeContent={0} color="error">
                            <ShoppingCart fontSize="medium" />
                        </Badge>
                    </IconButton>


                    <LogoutButton />

                </ActionIcons>
            </Toolbar>
        </StyledAppBar>
    );
};

export default Navbar;