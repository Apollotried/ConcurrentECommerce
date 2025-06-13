import { useState } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    Snackbar,
    Alert
} from '@mui/material';
import { CreditCard } from '@mui/icons-material';

const PaymentStep = ({ onBack, onSubmit }) => {
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });
    const [error, setError] = useState(null);

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateCard = (cardNumber) => {
        if (!cardNumber) return false;
        const lastChar = cardNumber.slice(-1);
        return !isNaN(lastChar) && parseInt(lastChar) % 2 === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!validateCard(cardData.number)) {
            setError('Payment failed: Card declined (mock service requires last digit to be even)');
            return;
        }

        const paymentData = {
            method: 'creditCard',
            token: `mock_card_token_${cardData.number.slice(-4)}_${Math.random().toString(36).substr(2, 8)}`,
            last4: cardData.number.slice(-4)
        };

        onSubmit(paymentData);
    };

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
                Credit Card Payment
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        label="Card Number"
                        name="number"
                        value={cardData.number}
                        onChange={handleCardChange}
                        placeholder="1234 5678 9012 3456"
                        inputProps={{
                            pattern: "[0-9]{13,16}",
                            title: "Enter a valid 13-16 digit card number (last digit must be even)"
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        label="Name on Card"
                        name="name"
                        value={cardData.name}
                        onChange={handleCardChange}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        required
                        fullWidth
                        label="Expiry Date"
                        name="expiry"
                        value={cardData.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        inputProps={{
                            pattern: "(0[1-9]|1[0-2])\/?([0-9]{2})",
                            title: "Enter expiry in MM/YY format"
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        required
                        fullWidth
                        label="CVC"
                        name="cvc"
                        value={cardData.cvc}
                        onChange={handleCardChange}
                        placeholder="123"
                        inputProps={{
                            pattern: "[0-9]{3,4}",
                            title: "Enter 3-4 digit CVC"
                        }}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={onBack} variant="outlined">
                    Back
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: '150px' }}
                >
                    Continue
                </Button>
            </Box>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PaymentStep;