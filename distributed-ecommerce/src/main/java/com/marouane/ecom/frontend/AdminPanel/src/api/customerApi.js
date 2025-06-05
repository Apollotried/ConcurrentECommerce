import axiosInstance from "./axiosInstance.js";
export const fetchAllCustomers = async (
    page = 0,
    size = 10,
    sortBy,
    sortDir,
    search
) => {
    const params = {
        page,
        size,
        ...(sortBy && { sortBy }),
        ...(sortDir && { sortDir }),
        ...(search && { search })
    };

    const response = await axiosInstance.get("/customers", { params });
    return response.data;
}

export const fetchCustomerCounts = async () =>{
    const response = await axiosInstance.get('/customers/count');
    return response.data;
}

export const createCustomer = async (customerData) => {
    try {
        const response = await axiosInstance.post('/customers', customerData);
        return response.data;
    } catch (error) {
        console.error('Error creating customer:', error.response?.data || error.message);
        throw error;
    }
};

export const updateCustomer = async (customerId, customerData) => {
    try {
        const response = await axiosInstance.put(`/customers/${customerId}`, customerData);
        return response.data;
    } catch (error) {
        console.error('Error updating customer:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteCustomer = async (customerId) => {
    try {
        await axiosInstance.delete(`/customers/${customerId}`);
    } catch (error) {
        console.error('Error deleting customer:', error.response?.data || error.message);
        throw error;
    }
};

