import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    Slider,
    InputAdornment,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { fetchAllProducts } from '../api/productApi';
import {
    MainContentBox,
    FilterSidebar,
    ProductsDisplayArea,
    productCardStyles,
} from './CatalogStyles';
import Navbar from "../navbar/NavBar.jsx";
import {addCartItem} from "../api/cartApi.jsx";

// Static image URLs for products
const productImages = [
    'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1577979749830-f1d742b96791?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1589&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    useEffect(() => {
        if (products.length > 0) {
            const initialQuantities = {};
            products.forEach(product => {
                initialQuantities[product.id] = 1;
            });
            setQuantities(initialQuantities);
        }
    }, [products]);




    const [categories, setCategories] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Pagination state
    const [page, setPage] = useState(0);
    const [size] = useState(6);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filters state
    const [filters, setFilters] = useState({
        searchTerm: '',
        priceRange: [0, 1500],
        category: 'All',
        sortBy: 'createdAt',
        sortDirection: 'desc'
    });

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            const response = await fetchAllProducts(
                page,
                size,
                filters.sortBy,
                filters.sortDirection,
                filters.searchTerm,
                filters.category
            );

            // Assign static images to products
            const productsWithImages = response.content.map((product, index) => ({
                ...product,
                imageUrl: productImages[index % productImages.length]
            }));

            setProducts(productsWithImages);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);

            // Extract unique categories
            const uniqueCategories = [...new Set(response.content.map(p => p.category))];
            setCategories(['All', ...uniqueCategories]);

        } catch (error) {
            console.error('Error fetching products:', error);
            setSnackbar({
                open: true,
                message: 'Failed to load products',
                severity: 'error'
            });
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, size, filters]);



    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(0);
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: '',
            priceRange: [0, 1500],
            category: 'All',
            sortBy: 'createdAt',
            sortDirection: 'desc'
        });
        setPage(0);
    };

    const handlePageChange = (event, value) => {
        setPage(value - 1); // MUI Pagination is 1-indexed, API is 0-indexed
    };


    const handleQuantityChange = (productId, newQuantity) => {
        const product = products.find(p => p.id === productId);
        const maxQuantity = product?.stock || 1;
        const validatedQuantity = Math.max(1, Math.min(maxQuantity, newQuantity));
        setQuantities(prev => ({
            ...prev,
            [productId]: validatedQuantity
        }));
    };



    const handleQuantityAdjust = (productId, delta) => {
        const product = products.find(p => p.id === productId);
        const maxQuantity = product?.stock || 1;
        const currentQuantity = quantities[productId] || 1;
        const newQuantity = Math.max(1, Math.min(maxQuantity, currentQuantity + delta));
        setQuantities(prev => ({
            ...prev,
            [productId]: newQuantity
        }));
    };


    const handleAddToCart = async (productId) => {
        const quantity = quantities[productId] || 1;
        try {
            await addCartItem(productId, quantity);
            setSnackbar({
                open: true,
                message: 'Item added to cart successfully!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to add item to cart',
                severity: 'error'
            });
        }
    };


    return (
        <>
            <Navbar />
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                    Product Catalog
                </Typography>

                <MainContentBox>
                    {/* Filter Sidebar */}
                    <FilterSidebar>
                        <Typography variant="h6" gutterBottom>Filter Products</Typography>

                        {/* Category Filter */}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                label="Category"
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>{category}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Search Filter */}
                        <TextField
                            fullWidth
                            label="Search"
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: filters.searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => handleFilterChange('searchTerm', '')} size="small">
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

                        {/* Sort Options */}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="createdAt">Newest</MenuItem>
                                <MenuItem value="price">Price</MenuItem>
                                <MenuItem value="name">Name</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Clear Filters Button */}
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={clearFilters}
                            startIcon={<ClearIcon />}
                            fullWidth
                        >
                            Clear Filters
                        </Button>
                    </FilterSidebar>

                    {/* Products Display */}
                    <ProductsDisplayArea container spacing={3}>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <Grid item key={product.id} xs={12} sm={6} lg={4}>
                                    <Card sx={productCardStyles}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={product.imageUrl}
                                            alt={product.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography gutterBottom variant="h6" component="h3">
                                                {product.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {product.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="h6" color="primary">
                                                    ${product.price.toFixed(2)}
                                                </Typography>
                                                <Chip
                                                    label={`In Stock: ${product.stock}`}
                                                    color="success"
                                                    size="small"
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                Category: {product.category}
                                            </Typography>

                                            {/* Quantity Selector */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                mb: 2
                                            }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleQuantityAdjust(product.id, -1)}
                                                    disabled={quantities[product.id] <= 1}
                                                >
                                                    -
                                                </Button>

                                                <TextField
                                                    size="small"
                                                    value={quantities[product.id] || 1}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value) || 1;
                                                        handleQuantityChange(product.id, value);
                                                    }}
                                                    inputProps={{
                                                        min: 1,
                                                        max: product.stock,
                                                        style: {
                                                            width: '40px',
                                                            textAlign: 'center',
                                                            // Hide number input spinners
                                                            MozAppearance: 'textfield',
                                                            WebkitAppearance: 'none',
                                                            appearance: 'textfield',
                                                        }
                                                    }}
                                                    sx={{
                                                        width: '60px',
                                                        // Hide number input spinners for different browsers
                                                        '& input[type=number]': {
                                                            MozAppearance: 'textfield',
                                                        },
                                                        '& input[type=number]::-webkit-outer-spin-button': {
                                                            WebkitAppearance: 'none',
                                                            margin: 0,
                                                        },
                                                        '& input[type=number]::-webkit-inner-spin-button': {
                                                            WebkitAppearance: 'none',
                                                            margin: 0,
                                                        },
                                                    }}
                                                />

                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleQuantityAdjust(product.id, 1)}
                                                    disabled={quantities[product.id] >= product.stock}
                                                >
                                                    +
                                                </Button>
                                            </Box>

                                            {/* Add to Cart Button */}
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                onClick={() => handleAddToCart(product.id)}
                                                sx={{ mt: 1 }}
                                            >
                                                Add to Cart
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography align="center" color="text.secondary">
                                    No products found matching your criteria
                                </Typography>
                            </Grid>
                        )}
                    </ProductsDisplayArea>
                </MainContentBox>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page + 1} // Convert to 1-based index
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}

                {/* Product Count */}
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    Showing {products.length} of {totalElements} products
                </Typography>

                {/* Notification Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default Catalog;