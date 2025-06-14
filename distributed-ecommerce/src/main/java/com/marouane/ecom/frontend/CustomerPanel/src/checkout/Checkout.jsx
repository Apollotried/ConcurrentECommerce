import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Stepper,
    Step,
    StepLabel,
    Box,
    Snackbar,
    Alert
} from '@mui/material';
import ShippingStep from './ShippingStep';
import PaymentStep from './PaymentStep';
import ReviewStep from './ReviewStep';
import { completeOrderWithShipping } from '../api/orderApi';

const steps = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [orderData, setOrderData] = useState({
        shipping: null,
        payment: null,
        items: null,
        total: 0
    });
    const [error, setError] = useState(null);
    const { state } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (state?.checkoutData) {
            setOrderData(prev => ({
                ...prev,
                items: state.checkoutData.items,
                total: state.checkoutData.total
            }));
        }
    }, [state]);

    const handleNext = () => setActiveStep(prev => prev + 1);
    const handleBack = () => setActiveStep(prev => prev - 1);

    const handleShippingSubmit = (data) => {
        setOrderData(prev => ({ ...prev, shipping: data }));
        handleNext();
    };

    const handlePaymentSubmit = (data) => {
        setOrderData(prev => ({ ...prev, payment: data }));
        handleNext();
    };

    const handlePlaceOrder = async () => {
        if (!orderData.shipping || !orderData.payment?.cardNumber) {
            setError('Missing shipping information or payment details');
            return;
        }

        try {
            const response = await completeOrderWithShipping({
                cardNumber: orderData.payment.cardNumber,  // Send raw card number
                shippingAddress: orderData.shipping
            });

            navigate('/order-confirmation', {
                state: {
                    orderId: response.id,
                    orderDetails: response
                }
            });
        } catch (err) {
            setError(err.message || 'Checkout failed. Please try again.');
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {activeStep === 0 && (
                <ShippingStep
                    onSubmit={handleShippingSubmit}
                    initialValues={orderData.shipping}
                />
            )}
            {activeStep === 1 && (
                <PaymentStep
                    onBack={handleBack}
                    onSubmit={handlePaymentSubmit}
                />
            )}
            {activeStep === 2 && (
                <ReviewStep
                    orderData={orderData}
                    onBack={handleBack}
                    onPlaceOrder={handlePlaceOrder}
                    error={error}
                    onDismissError={handleCloseError}
                />
            )}
        </Container>
    );
};

export default Checkout;