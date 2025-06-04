import axiosInstance from "./axiosInstance.js";

export const fetchLowStockProductCount = async (threshold = 5) => {
    const response = await axiosInstance.get("/inventory/low-stock/count", {
        params: { threshold }
    });
    return response.data;
};


export const fetchInventoryCounts = async (lowStockThreshold = 5) => {
    const response = await axiosInstance.get("/inventory/counts", {
        params: { lowStockThreshold }
    });
    return response.data;
};


export const fetchAllInventory = async (
    page = 0,
    size = 5,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    searchTerm = '',
    stockLevel  = 'All'
) => {
    const params = {
        page,
        size,
        ...(sortBy && { sortBy }),
        ...(sortDirection && { sortDirection }),
        ...(searchTerm && { search: searchTerm }),
        ...(stockLevel !== 'All' && { stockLevel })
    };

    const response = await axiosInstance.get('/inventory', { params });
    return response.data;
};


export const updateInventoryQuantity = async (productId, newQuantity) => {
    const response = await axiosInstance.put(`/inventory/${productId}`, null, {
        params: { newQuantity }
    });
    return response.data;
};


export const deleteProductInventory = async (productId) => {
    await axiosInstance.delete(`/inventory/${productId}`);
};

export const createInventory = async (productId, quantity) => {
    const response = await axiosInstance.post(`/inventory/create/${productId}/${quantity}`);
    return response.data;
};

