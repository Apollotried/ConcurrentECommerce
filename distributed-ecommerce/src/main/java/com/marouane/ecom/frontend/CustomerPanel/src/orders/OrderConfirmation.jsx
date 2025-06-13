import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const OrderConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const orderId = state?.orderId || 'N/A';

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                    Thank You For Your Order!
                </Typography>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Your order number is: #{orderId}
                </Typography>
                <Typography sx={{ mb: 4 }}>
                    We've sent a confirmation email with your order details.
                    You'll receive another email when your order ships.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/products')}
                        sx={{ minWidth: '200px' }}
                    >
                        Continue Shopping
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/orders')}
                        sx={{ minWidth: '200px' }}
                    >
                        View Order History
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default OrderConfirmation;