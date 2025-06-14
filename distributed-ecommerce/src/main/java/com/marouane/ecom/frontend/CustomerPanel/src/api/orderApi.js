import axiosInstance from "./axiosInstance";

export const createOrderFromCart = async () => {
    try {
        const response = await axiosInstance.post('/orders/create');
        return response.data;
    } catch (error) {
        console.error('Error creating order from cart:', error);
        throw error;
    }
};

export const completeOrder = async (paymentToken) => {
    try {
        const response = await axiosInstance.post('/orders/checkout', {
            paymentToken
        });
        return response.data;
    } catch (error) {
        console.error('Error completing order:', error);
        throw error;
    }
};


export const cancelOrder = async (orderId) => {
    try {
        await axiosInstance.post(`/orders/${orderId}/cancel`);
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};


export const fetchUserOrders = async () => {
    try {
        const response = await axiosInstance.get('/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
};

export const fetchOrderDetails = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};

export const completeOrderWithShipping = async (data) => {
    try {
        const response = await axiosInstance.post('/orders/checkout', data);

        if (response.data && response.data.success === false) {
            throw new Error(response.data.message);
        }

        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};