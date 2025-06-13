import { useState } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

const ShippingStep = ({ onSubmit, initialValues }) => {
    const [shippingData, setShippingData] = useState({
        firstName: initialValues?.firstName || '',
        lastName: initialValues?.lastName || '',
        address: initialValues?.address || '',
        city: initialValues?.city || '',
        state: initialValues?.state || '',
        zipCode: initialValues?.zipCode || '',
        country: initialValues?.country || 'US',
        phone: initialValues?.phone || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(shippingData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
                Shipping Information
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={shippingData.firstName}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={shippingData.lastName}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        label="Address"
                        name="address"
                        value={shippingData.address}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="City"
                        name="city"
                        value={shippingData.city}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="State/Province"
                        name="state"
                        value={shippingData.state}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Zip/Postal Code"
                        name="zipCode"
                        value={shippingData.zipCode}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Country</InputLabel>
                        <Select
                            name="country"
                            value={shippingData.country}
                            onChange={handleChange}
                            label="Country"
                        >
                            <MenuItem value="US">United States</MenuItem>
                            <MenuItem value="CA">Canada</MenuItem>
                            <MenuItem value="UK">United Kingdom</MenuItem>
                            <MenuItem value="FR">France</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={shippingData.phone}
                        onChange={handleChange}
                        inputProps={{ pattern: "[0-9]{10,15}" }}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button type="submit" variant="contained" color="primary">
                    Continue to Payment
                </Button>
            </Box>
        </Box>
    );
};

export default ShippingStep;