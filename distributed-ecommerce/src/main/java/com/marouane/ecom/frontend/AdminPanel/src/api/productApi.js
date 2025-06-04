import axiosInstance from "./axiosInstance.js";

export const fetchProductCount = async () =>{
    const response = await axiosInstance.get("/products/count");
    return response.data;
}

export const fetchActiveProductCount = async () =>{
    const response = await axiosInstance.get("/products/activeCount");
    return response.data;
}

export const fetchAllProducts = async (
    page = 0,
    size = 5,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    searchTerm = '',
    category = 'All',
    status = null
) => {
    const params = {
        page,
        size,
        ...(sortBy && { sortBy }), // only include if not null/empty
        ...(sortDirection && { sortDir: sortDirection }),
        ...(searchTerm && { search: searchTerm }),
        ...(category && category !== 'All' && { category }),
        ...(status && { status })
    };

    const response = await axiosInstance.get('/products', { params });
    return response.data;
};



export const createProduct = async (productData) => {
    const response = await axiosInstance.post("/products", productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
}

export const softDeleteProduct = async (id) => {
    const response = await axiosInstance.delete(`/products/${id}/soft`);
    return response.data;
};

export const hardDeleteProduct = async (id) => {
    const response = await axiosInstance.delete(`/products/${id}/hard`);
    return response.data;
};


export const getProductsWithoutInventory = async (
    page = 0,
    size = 10
) => {
    const response = await axiosInstance.get('/products/no-inventory', {
        params: { page, size  },
    });
    return response.data;
};