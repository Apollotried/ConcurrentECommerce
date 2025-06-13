import {
    Container,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Box,
    TextField,
    Snackbar,
    Alert,
    CircularProgress,
    Pagination
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import Navbar from "../navbar/NavBar.jsx";
import { fetchAllCartItems } from '../api/cartApi.jsx';

const Cart = () => {
    const [cartData, setCartData] = useState({
        content: [],
        number: 0,
        size: 4,
        totalElements: 0,
        totalPages: 1,
        first: true,
        last: true
    });
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const loadCartItems = async () => {
            try {
                setLoading(true);
                const data = await fetchAllCartItems(cartData.number, cartData.size);
                setCartData(data);
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Failed to load cart items',
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        };
        loadCartItems();
    }, [cartData.number]);

    const handlePageChange = (event, newPage) => {
        // Axios uses 0-based pages, Pagination uses 1-based
        setCartData(prev => ({ ...prev, number: newPage - 1 }));
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            // TODO: Call your update quantity API endpoint here
            // await updateCartItemQuantity(itemId, newQuantity);
            setCartData(prev => ({
                ...prev,
                content: prev.content.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            }));
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to update quantity',
                severity: 'error',
            });
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            // TODO: Call your remove item API endpoint here
            // await removeCartItem(itemId);
            setCartData(prev => ({
                ...prev,
                content: prev.content.filter(item => item.id !== itemId),
                totalElements: prev.totalElements - 1
            }));
            setSnackbar({
                open: true,
                message: 'Item removed from cart',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to remove item',
                severity: 'error',
            });
        }
    };

    const handleCheckout = () => {
        setSnackbar({
            open: true,
            message: 'Checkout simulated successfully!',
            severity: 'success',
        });
    };

    const total = cartData.content.reduce(
        (sum, item) => sum + item.productPrice * item.quantity,
        0
    );

    return (
        <>
            <Navbar />
            <Container sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Shopping Cart
                    </Typography>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : cartData.content.length === 0 ? (
                        <Typography>Your cart is empty</Typography>
                    ) : (
                        <>
                            <List>
                                {cartData.content.map((item) => (
                                    <div key={item.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={item.productName}
                                                secondary={`$${item.productPrice.toFixed(2)} x ${item.quantity}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Remove />
                                                </IconButton>
                                                <TextField
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const value = Math.max(1, Number(e.target.value) || 1);
                                                        handleUpdateQuantity(item.id, value);
                                                    }}
                                                    type="number"
                                                    inputProps={{ min: 1, style: { width: 48, textAlign: 'center' } }}
                                                    sx={{ width: 60, mx: 0.5 }}
                                                />
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Add />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    sx={{ ml: 1 }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider />
                                    </div>
                                ))}
                            </List>

                            {cartData.totalPages > 1 && (
                                <Box display="flex" justifyContent="center" my={2}>
                                    <Pagination
                                        count={cartData.totalPages}
                                        page={cartData.number + 1} // Convert to 1-based
                                        onChange={handlePageChange}
                                        color="primary"
                                    />
                                </Box>
                            )}

                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">
                                    Total: ${total.toFixed(2)}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleCheckout}
                                >
                                    Checkout
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default Cart;