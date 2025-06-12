import React, { useState, useEffect } from 'react';
import './products.css';


import {
    createProduct,
    fetchActiveProductCount,
    fetchAllProducts,
    fetchProductCount, hardDeleteProduct, softDeleteProduct,
    updateProduct
} from "../api/productApi.js";
import {fetchLowStockProductCount} from "../api/inventoryApi.js";
import {showErrorToast, showSuccessToast} from "../utils/toast.jsx";

function Products() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);


    const [totalCount, setTotalCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);


    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);


    const [filters, setFilters] = useState({
        searchTerm: '',
        category: 'All',
        status: null,
        sortBy: 'createdAt',
        sortDirection: 'desc'
    });

    const [categories, setCategories] = useState(['All']);

    const refreshCounts = async () => {
        try {
            const [total, active, lowStock] = await Promise.all([
                fetchProductCount(),
                fetchActiveProductCount(),
                fetchLowStockProductCount(5)
            ]);
            setTotalCount(total);
            setActiveCount(active);
            setLowStockCount(lowStock);
        } catch (error) {
            console.error("Error refreshing counts:", error);
            showErrorToast("Failed to load product statistics");
        }
    };

    const loadProducts = async () => {
        try {
            const productsData = await fetchAllProducts(
                page,
                size,
                filters.sortBy,
                filters.sortDirection,
                filters.searchTerm,
                filters.category,
                filters.status
            );

            setProducts(productsData.content);
            setTotalPages(productsData.totalPages);

            // Extract unique categories from the response
            const uniqueCategories = ['All', ...new Set(productsData.content.map(p => p.category))];
            setCategories(uniqueCategories);

        } catch (error) {
            console.error("Error fetching products:", error);
            showErrorToast("Failed to load products");
        }
    };

    useEffect(() => {
        refreshCounts();
    }, [])

    useEffect(() => {
        loadProducts();
    }, [page, size, filters]);


    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newProduct = {
            productName: formData.get("name"),
            category: formData.get("category"),
            price: parseFloat(formData.get("price")),
            status: formData.get("status"),
            description: formData.get("description")
        };

        try {
            const addedProduct = await createProduct(newProduct);
            await loadProducts();
            await refreshCounts();
            setShowAddModal(false);
            showSuccessToast("Product created successfully!");
        }catch (err){
            console.error("Error adding product:", err);
            showErrorToast(err.response?.data?.message || "Failed to create product");
        }


    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        const form = e.target;

        const productRequest = {
            productName: form.elements.name.value,
            category: form.elements.category.value,
            price: parseFloat(form.elements.price.value),
            status: form.elements.status.value,
            description: form.elements.description.value
        };

        try {
            const updatedProduct = await updateProduct(currentProduct.id, productRequest);
            await loadProducts();
            await refreshCounts();
            setShowEditModal(false);
            showSuccessToast("Product updated successfully!");
        } catch (err) {
            console.error("Failed to update product:", err);
            showErrorToast(err.response?.data?.message || "Failed to update product");
        }
    };


    const handleSort = (key) => {
        setFilters(prev => ({
            ...prev,
            sortBy: key,
            sortDirection:
                prev.sortBy === key && prev.sortDirection === 'asc'
                    ? 'desc'
                    : 'asc',
        }));
        setPage(0);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
        }));

        setPage(0);

    };

    const handleSoftDelete = async (id) => {
        if (window.confirm('Are you sure you want to discontinue this product?')) {
            try {
                await softDeleteProduct(id);
                // Refresh your products list
                await loadProducts();
                await refreshCounts();
                showSuccessToast("Product discontinued successfully");
            } catch (error) {
                console.error("Error soft deleting product:", error);
                showErrorToast(error.response?.data?.message || "Failed to discontinue product");
            }
        }
    };

    const handleHardDelete = async (id) => {
        if (window.confirm('WARNING: This will permanently delete the product. Are you sure?')) {
            try {
                await hardDeleteProduct(id);
                // Refresh your products list
                await loadProducts();
                await refreshCounts();
                showSuccessToast("Product deleted permanently");
            } catch (error) {
                console.error("Error hard deleting product:", error);
                showErrorToast(error.response?.data?.message || "Failed to delete product");
            }
        }
    };

    return (
        <div className="products-container">
            <div className="products-header">
                <h2>Product Management</h2>
                <div className="products-actions">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}                    />
                    <select value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status || 'All'}
                        onChange={(e) => handleFilterChange('status', e.target.value === 'All' ? null : e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="DISCONTINUED">Discontinued</option>
                    </select>
                    <button onClick={() => setShowAddModal(true)} className="add-product-btn">
                        + Add Product
                    </button>
                </div>
            </div>

            <div className="products-stats">
                <div className="stat-card">
                    <h3>Total Products</h3>
                    <p>{totalCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Products</h3>
                    <p>{activeCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Low Stock (&lt;5)</h3>
                    <p>{lowStockCount}</p>
                </div>
            </div>

            <div className="table-responsive">
                <table className="products-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>ID {filters.sortBy === 'id' && (filters.sortDirection === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('name')}>Name {filters.sortBy === 'name' && (filters.sortDirection === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('category')}>Category {filters.sortBy === 'category' && (filters.sortDirection === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('price')}>Price {filters.sortBy === 'price' && (filters.sortDirection === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('stock')}>Stock {filters.sortBy === 'stock' && (filters.sortDirection === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('status')}>Status {filters.sortBy === 'status' && (filters.sortDirection === 'asc' ? '↑' : '↓')}</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-description">{product.description}</div>
                                </td>
                                <td>{product.category}</td>
                                <td>${product.price.toFixed(2)}</td>
                                <td>{product.stock}</td>
                                <td>
                                        <span className={`status-badge ${product.status.toLowerCase()}`}>
                                            {product.status}
                                        </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="edit"
                                            onClick={() => {
                                                setCurrentProduct(product);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => handleHardDelete(product.id)}
                                        >
                                            Delete
                                        </button>

                                        <button
                                            className="discontinue"
                                            onClick={() => handleSoftDelete(product.id)}
                                        >
                                            discontinue
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="no-results">No products found</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>
                        Previous
                    </button>
                    <span>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => p+1)} disabled={page >= totalPages - 1}>
                        Next
                    </button>
                </div>
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Add New Product</h3>
                                <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleAddProduct}>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" name="name" required/>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" name="category" required/>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input type="number" name="price" step="0.01" required/>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" required>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="DISCONTINUED">Discontinued</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="3"></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Add Product</button>
                                    <button type="button" className="cancel-btn"
                                            onClick={() => setShowAddModal(false)}>Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && currentProduct && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Product</h3>
                                <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleEditProduct}>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" name="name" defaultValue={currentProduct.name} required/>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" name="category" defaultValue={currentProduct.category} required/>
                                </div>
                                <div className="form-row">
                                <div className="form-group">
                                        <label>Price</label>
                                        <input type="number" name="price" step="0.01" defaultValue={currentProduct.price} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" defaultValue={currentProduct.status} required>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="DISCONTINUED">Discontinued</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="3" defaultValue={currentProduct.description}></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Save Changes</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;