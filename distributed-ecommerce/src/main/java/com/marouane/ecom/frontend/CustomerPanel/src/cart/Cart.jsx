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
import {
    fetchAllCartItems,
    updateCartItemQuantity,
    removeCartItem,
    validateCart
} from '../api/cartApi.jsx';
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const navigate = useNavigate();
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
    const [updatingItems, setUpdatingItems] = useState({}); // Track items being updated

    useEffect(() => {
        const loadCartItems = async () => {
            try {
                setLoading(true);
                const data = await fetchAllCartItems(cartData.number, cartData.size);
                setCartData(data);
            } catch (error) {
                showSnackbar('Failed to load cart items', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadCartItems();
    }, [cartData.number]);

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handlePageChange = (event, newPage) => {
        setCartData(prev => ({ ...prev, number: newPage - 1 }));
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

            // Update on server
            await updateCartItemQuantity(itemId, newQuantity);

            // Update local state
            setCartData(prev => ({
                ...prev,
                content: prev.content.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            }));
        } catch (error) {
            showSnackbar('Failed to update quantity', 'error');
            // Revert to previous quantity
            setCartData(prev => ({ ...prev }));
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

            // Remove from server
            await removeCartItem(itemId);

            // Update local state
            setCartData(prev => ({
                ...prev,
                content: prev.content.filter(item => item.id !== itemId),
                totalElements: prev.totalElements - 1
            }));

            showSnackbar('Item removed from cart', 'success');
        } catch (error) {
            showSnackbar('Failed to remove item', 'error');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleCheckout = async () => {
        if (cartData.content.length === 0) {
            showSnackbar('Your cart is empty', 'warning');
            return;
        }

        try {
            // Validate cart before checkout
            await validateCart();

            // Prepare cart data for checkout
            const checkoutData = {
                items: cartData.content,
                total: cartData.content.reduce(
                    (sum, item) => sum + (item.productPrice * item.quantity),
                    0
                )
            };

            navigate('/checkout', { state: { checkoutData } });
        } catch (error) {
            showSnackbar(
                error.message || 'Cannot proceed to checkout. Please review your cart.',
                'error'
            );
        }
    };

    const total = cartData.content.reduce(
        (sum, item) => sum + (item.productPrice * item.quantity),
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
                                                    disabled={item.quantity <= 1 || updatingItems[item.id]}
                                                >
                                                    {updatingItems[item.id] ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        <Remove />
                                                    )}
                                                </IconButton>
                                                <TextField
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const value = Math.max(1, Number(e.target.value) || 1);
                                                        handleUpdateQuantity(item.id, value);
                                                    }}
                                                    type="number"
                                                    inputProps={{
                                                        min: 1,
                                                        style: {
                                                            width: 48,
                                                            textAlign: 'center',
                                                            // Remove arrows for Chrome, Safari, Edge, Opera
                                                            MozAppearance: 'textfield',
                                                            appearance: 'textfield'
                                                        },
                                                        // Remove arrows for Firefox
                                                        'aria-hidden': true
                                                    }}
                                                    sx={{
                                                        width: 60,
                                                        mx: 0.5,
                                                        // Hide the default number input spinner
                                                        '& input[type=number]': {
                                                            '-moz-appearance': 'textfield',
                                                            '-webkit-appearance': 'textfield',
                                                            appearance: 'textfield',
                                                        },
                                                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                                            '-webkit-appearance': 'none',
                                                            margin: 0,
                                                        }
                                                    }}
                                                />
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={updatingItems[item.id]}
                                                >
                                                    {updatingItems[item.id] ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        <Add />
                                                    )}
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    sx={{ ml: 1 }}
                                                    disabled={updatingItems[item.id]}
                                                >
                                                    {updatingItems[item.id] ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        <Delete />
                                                    )}
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
                                        page={cartData.number + 1}
                                        onChange={handlePageChange}
                                        color="primary"
                                    />
                                </Box>
                            )}

                            <Box sx={{
                                mt: 4,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6">
                                    Total: ${total.toFixed(2)}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleCheckout}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Checkout'}
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    <Alert
                        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default Cart;