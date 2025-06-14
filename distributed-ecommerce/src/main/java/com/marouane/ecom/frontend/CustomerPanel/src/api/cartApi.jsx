import axiosInstance from "./axiosInstance.js";

export const fetchAllCartItems = async (
    page = 0,
    size = 4,
) => {
    const params = {
        page,
        size,
    };

    const response = await axiosInstance.get('/cart/items', { params });
    return response.data;
};


export const addCartItem = async (productId, quantity) => {
    try {
        const response = await axiosInstance.post(`/cart/add/${productId}/${quantity}`);
        return response.data;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
};

export const updateCartItemQuantity = async (itemId, quantity) => {
    try {
        const response = await axiosInstance.put(`/cart/update/${itemId}`, null, {
            params: { quantity }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        throw error;
    }
};

export const removeCartItem = async (itemId) => {
    try {
        await axiosInstance.delete(`/cart/remove/${itemId}`);
    } catch (error) {
        console.error('Error removing cart item:', error);
        throw error;
    }
};

export const validateCart = async () => {
    try {
        const response = await axiosInstance.post('/cart/validate');
        return response.data;
    } catch (error) {
        if (error.response?.status === 409) {
            throw new Error('Your cart was modified. Please refresh and try again.');
        }
        console.error('Error validating cart:', error);
        throw error;
    }
};

export const clearCart = async () => {
    try {
        await axiosInstance.post('/cart/clear');
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};