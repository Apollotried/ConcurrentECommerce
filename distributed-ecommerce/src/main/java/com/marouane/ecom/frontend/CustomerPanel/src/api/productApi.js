import axiosInstance from "./axiosInstance.js";



export const fetchAllProducts = async (
    page = 0,
    size = 5,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    searchTerm = '',
    category = 'All',
) => {
    const params = {
        page,
        size,
        ...(sortBy && { sortBy }), // only include if not null/empty
        ...(sortDirection && { sortDir: sortDirection }),
        ...(searchTerm && { search: searchTerm }),
        ...(category && category !== 'All' && { category }),
    };

    const response = await axiosInstance.get('/products/available', { params });
    return response.data;
};