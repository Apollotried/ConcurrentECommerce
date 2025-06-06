import React, { useState, useEffect } from 'react';
import './inventory.css';
import {
    fetchInventoryCounts,
    fetchAllInventory, deleteProductInventory, updateInventoryQuantity, createInventory, bulkUpdateStock
} from '../api/inventoryApi';
import {getProductsWithoutInventory} from "../api/productApi.js";


const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);


    const [counts, setCounts] = useState({
        total: 0,
        lowStock: 0,
        outOfStock: 0,
        inStock: 0
    });



    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);


    const [filters, setFilters] = useState({
        searchTerm: '',
        stockLevel: 'All',
        sortBy: 'createdAt',
        sortDirection: 'desc'
    });


    const [availableProducts, setAvailableProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);


    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleProductSelection = (product) => {
        setSelectedProduct(product);
        setNewInventoryItem({
            productId: product.id,
            quantity: '0'
        });
    };


    const loadInventories = async () => {
        try {
            const inventoryData = await fetchAllInventory(
                currentPage,
                size,
                filters.sortBy,
                filters.sortDirection,
                filters.searchTerm,
                filters.stockLevel
            );

            setInventory(inventoryData.content);
            setTotalPages(inventoryData.totalPages);

        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };


    const [availablePage, setAvailablePage] = useState(0);
    const [availableSize] = useState(4);
    const [availableTotalPages, setAvailableTotalPages] = useState(0);


    const [selectedFile, setSelectedFile] = useState(null);


    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                loadInventories(),
                fetchInventoryCounts().then(setCounts)
            ]);
        };

        loadInitialData();

    }, [currentPage, size, filters]);

    useEffect(() => {
        const loadAvailableProducts = async () => {
            if (showAddModal) {
                setIsLoadingProducts(true);
                try {
                    const res  = await getProductsWithoutInventory(availablePage, availableSize);
                    setAvailableProducts(res.content);
                    setAvailableTotalPages(res.totalPages);
                } catch (error) {
                    console.error("Error loading available products:", error);
                } finally {
                    setIsLoadingProducts(false);
                }
            }
        };
        loadAvailableProducts();
    }, [showAddModal, availablePage]);



    const handleSort = (key) => {
        setFilters(prev => ({
            ...prev,
            sortBy: key,
            sortDirection:
                prev.sortBy === key && prev.sortDirection === 'asc'
                    ? 'desc'
                    : 'asc'
        }));
        setCurrentPage(0)
    };


    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const [newInventoryItem, setNewInventoryItem] = useState({
        productId: '',
        quantity: ''
    });
    const [editQuantity, setEditQuantity] = useState('');

    const handleAddInventory = async () => {
        try {
            await createInventory(parseInt(newInventoryItem.productId), parseInt(newInventoryItem.quantity));
            // Refresh data
            await loadInventories();

            setShowAddModal(false);
            setNewInventoryItem({ productId: '', quantity: '' });

            const countsData = await fetchInventoryCounts();
            setCounts(countsData);
        } catch (error) {
            console.error('Error adding inventory:', error);
            alert('Failed to add inventory: ' + error.message);
        }
    };

    const handleUpdateInventory = async () => {
        try {
            await updateInventoryQuantity(currentItem.productId, parseInt(editQuantity));
            // Refresh data
            await loadInventories();

            const countsData = await fetchInventoryCounts();
            setCounts(countsData);
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating inventory:', error);
            alert('Failed to update inventory: ' + error.message);
        }
    };

    const handleDeleteItem = async (productId) => {
        if (window.confirm('Are you sure you want to delete this inventory item?')) {
            try {
                await deleteProductInventory(productId);
                // Refresh data
                await loadInventories();

                const countsData = await fetchInventoryCounts();
                setCounts(countsData);
            } catch (error) {
                console.error('Error deleting inventory:', error);
                alert('Failed to delete inventory: ' + error.message);
            }
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        setCurrentPage(0);
    };



    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            handleBulkUpload(file);
        }
    };

    const handleBulkUploadClick = () => {
        document.getElementById('bulk-upload-input').click();
    };


    const handleBulkUpload = async (file) => {
        try {
            const result = await bulkUpdateStock(file);

            alert(`Successfully processed ${result.processedCount} records`);

            loadInventories();
        } catch (error) {
            console.error('Bulk upload failed:', error);
            alert(`Upload failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setSelectedFile(null);
            document.getElementById('bulk-upload-input').value = '';
        }
    };


    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h2>Inventory Management</h2>
                <div className="inventory-actions">
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />

                    <select
                        value={filters.stockLevel}
                        onChange={(e) =>
                            setFilters((prev) => ({...prev, stockLevel: e.target.value}))
                        }
                    >
                        <option value="All">All</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                        <option value="normal">normal Stock</option>
                    </select>


                    <button
                        onClick={() => {
                            setShowAddModal(true);
                            setSelectedProduct(null);
                            setNewInventoryItem({productId: '', quantity: ''});
                            setAvailablePage(0);
                        }}
                        className="add-item-btn"
                    >
                        + Add Item
                    </button>


                    <input
                        type="file"
                        id="bulk-upload-input"
                        accept=".csv"
                        style={{display: 'none'}}
                        onChange={handleFileChange}
                    />

                    {/* Bulk upload button */}
                    <button
                        onClick={handleBulkUploadClick}
                        className="bulk-upload-btn"
                    >
                        Bulk Upload
                    </button>


                </div>
            </div>

            <div className="inventory-stats">
                <div className="stat-card">
                    <h3>Total Items</h3>
                    <p>{counts.total}</p>
                </div>
                <div className="stat-card">
                    <h3>In Stock</h3>
                    <p>{counts.inStock}</p>
                </div>
                <div className="stat-card">
                    <h3>Low Stock</h3>
                    <p>{counts.lowStock}</p>
                </div>
                <div className="stat-card warning">
                    <h3>Out of Stock</h3>
                    <p>{counts.outOfStock}</p>
                </div>
            </div>

            <div className="table-responsive">
                <table className="inventory-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('productId')}>
                            Product ID {filters.sortBy === 'productId' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('product.name')}>
                            Product
                            Name {filters.sortBy === 'product.name' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('totalQuantity')}>
                            Stock {filters.sortBy === 'totalQuantity' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Available</th>
                        <th>Reserved</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {inventory.length > 0 ? (
                        inventory.map(item => (
                            <tr key={item.id}>
                                <td>{item.productId}</td>
                                <td>{item.productName}</td>
                                <td>
                                    {item.totalQuantity}
                                    {item.totalQuantity < 5 && (
                                        <span className="threshold-warning"> (Low)</span>
                                    )}
                                </td>
                                <td>{item.availableQuantity}</td>
                                <td>{item.totalReserved}</td>
                                <td>
                                <div className="action-buttons">
                                        <button
                                            className="edit"
                                            onClick={() => {
                                                setCurrentItem(item);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => handleDeleteItem(item.productId)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="no-results">No inventory items found</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage + 1} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                    >
                        Next
                    </button>
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ width: '80%', maxWidth: '1000px' }}>
                        <div className="modal-header">
                            <h3>Add New Inventory Item</h3>
                            <button onClick={() => {
                                setShowAddModal(false);
                                setSelectedProduct(null);
                                setNewInventoryItem({ productId: '', quantity: '' });
                            }}>×</button>
                        </div>

                        <div className="modal-body">
                            {!selectedProduct ? (
                                <>
                                    <h4>Select a Product</h4>
                                    <div className="table-responsive">
                                        <table className="products-table">
                                            <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {isLoadingProducts ? (
                                                <tr>
                                                    <td colSpan="6">Loading products...</td>
                                                </tr>
                                            ) : availableProducts.length > 0 ? (
                                                availableProducts.map(product => (
                                                    <tr key={product.id}>
                                                        <td>{product.id}</td>
                                                        <td>{product.name}</td>
                                                        <td>{product.category}</td>
                                                        <td>${product.price?.toFixed(2)}</td>
                                                        <td>
                                                                <span className={`status-badge ${product.status?.toLowerCase()}`}>
                                                                    {product.status}
                                                                </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="select-btn"
                                                                onClick={() => handleProductSelection(product)}
                                                            >
                                                                Select
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="no-results">
                                                        No available products found
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {availableTotalPages > 1 && (
                                        <div className="modal-pagination">
                                            <button
                                                onClick={() => setAvailablePage(p => Math.max(0, p - 1))}
                                                disabled={availablePage === 0}
                                            >
                                                Previous
                                            </button>
                                            <span>Page {availablePage + 1} of {availableTotalPages}</span>
                                            <button
                                                onClick={() => setAvailablePage(p => p + 1)}
                                                disabled={availablePage >= availableTotalPages - 1}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="selected-product">
                                        <h4>Selected Product: {selectedProduct.name}</h4>
                                        <p>Category: {selectedProduct.category}</p>
                                        <button
                                            className="change-btn"
                                            onClick={() => setSelectedProduct(null)}
                                        >
                                            Change Product
                                        </button>
                                    </div>

                                    <div className="form-group">
                                        <label>Initial Quantity:</label>
                                        <input
                                            type="number"
                                            value={newInventoryItem.quantity}
                                            onChange={(e) => setNewInventoryItem({
                                                ...newInventoryItem,
                                                quantity: e.target.value
                                            })}
                                            placeholder="Enter initial quantity"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div className="modal-footer">
                                        <button onClick={() => {
                                            setShowAddModal(false);
                                            setSelectedProduct(null);
                                            setNewInventoryItem({ productId: '', quantity: '' });
                                        }}>
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddInventory}
                                            className="primary"
                                            disabled={!newInventoryItem.quantity}
                                        >
                                            Add Inventory
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Inventory Modal */}
            {showEditModal && currentItem && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit Inventory for {currentItem.productName}</h3>
                            <button onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Current Quantity: {currentItem.totalQuantity}</label>
                            </div>
                            <div className="form-group">
                                <label>New Quantity:</label>
                                <input
                                    type="number"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                    placeholder={`Current: ${currentItem.totalQuantity}`}
                                    min={currentItem.totalReserved} // Can't go below reserved quantity
                                />
                                <small className="hint">
                                    Note: Cannot set quantity below currently reserved stock ({currentItem.totalReserved})
                                </small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button onClick={handleUpdateInventory} className="primary">
                                Update Inventory
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;