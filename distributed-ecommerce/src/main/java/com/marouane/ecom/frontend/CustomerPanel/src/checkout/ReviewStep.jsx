import {
    Box,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Grid,
    Alert
} from '@mui/material';
import { LocalShipping, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const ReviewStep = ({ orderData, onBack, onPlaceOrder, error, onDismissError }) => {
    const navigate = useNavigate();

    const calculateSubtotal = () => {
        return orderData.items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
    };

    const calculateTax = () => calculateSubtotal() * 0.1;
    const calculateTotal = () => calculateSubtotal() + calculateTax();

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Review Your Order
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalShipping sx={{ mr: 1 }} /> Shipping Information
                        </Typography>
                        <Typography>{orderData.shipping.firstName} {orderData.shipping.lastName}</Typography>
                        <Typography>{orderData.shipping.address}</Typography>
                        <Typography>{orderData.shipping.city}, {orderData.shipping.state} {orderData.shipping.zipCode}</Typography>
                        <Typography>{orderData.shipping.country}</Typography>
                        <Typography>Phone: {orderData.shipping.phone}</Typography>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <Payment sx={{ mr: 1 }} /> Payment Method
                        </Typography>
                        <Typography>Credit Card</Typography>
                        <Typography>•••• •••• •••• {orderData.payment.last4}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Order Summary
                        </Typography>

                        <List>
                            {orderData.items.map((item) => (
                                <ListItem key={item.productId} disablePadding sx={{ py: 1 }}>
                                    <ListItemText
                                        primary={`${item.productName} (x${item.quantity})`}
                                        secondary={formatCurrency(item.productPrice)}
                                    />
                                    <Typography>
                                        {formatCurrency(item.productPrice * item.quantity)}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Subtotal:</Typography>
                            <Typography>{formatCurrency(calculateSubtotal())}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Shipping:</Typography>
                            <Typography>FREE</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Tax:</Typography>
                            <Typography>{formatCurrency(calculateTax())}</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Total:</Typography>
                            <Typography variant="h6">{formatCurrency(calculateTotal())}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {error && (
                <Alert
                    severity="error"
                    onClose={onDismissError}
                    sx={{ mt: 2 }}
                >
                    {error}
                    <Box sx={{ mt: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={onBack}
                            sx={{ mr: 1 }}
                        >
                            Update Payment
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/')}
                        >
                            Return to Home
                        </Button>
                    </Box>
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={onBack}>
                    Back
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/products')}
                    >
                        Continue Shopping
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onPlaceOrder}
                    >
                        Place Order
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ReviewStep;