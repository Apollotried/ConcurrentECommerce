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