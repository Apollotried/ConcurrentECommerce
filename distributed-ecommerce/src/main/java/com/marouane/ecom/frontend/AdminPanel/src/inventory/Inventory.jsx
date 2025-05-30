import React, { useState } from 'react';
import './inventory.css';

const Inventory = () => {
    // Sample inventory data
    const [inventory, setInventory] = useState([
        {
            id: 1,
            productId: 'PROD-001',
            name: 'Wireless Headphones',
            sku: 'WH-1000XM4',
            category: 'Electronics',
            currentStock: 45,
            available: 42,
            reserved: 3,
            lowStockThreshold: 10,
            status: 'In Stock',
            location: 'A12-4',
            lastUpdated: '2023-11-15'
        },
        {
            id: 2,
            productId: 'PROD-002',
            name: 'Yoga Mat',
            sku: 'YG-200-PRO',
            category: 'Fitness',
            currentStock: 8,
            available: 8,
            reserved: 0,
            lowStockThreshold: 5,
            status: 'Low Stock',
            location: 'B05-2',
            lastUpdated: '2023-11-14'
        },
        {
            id: 3,
            productId: 'PROD-003',
            name: 'Smart Watch',
            sku: 'SW-G4-BLK',
            category: 'Electronics',
            currentStock: 0,
            available: 0,
            reserved: 0,
            lowStockThreshold: 5,
            status: 'Out of Stock',
            location: 'C08-1',
            lastUpdated: '2023-11-10'
        },
        {
            id: 4,
            productId: 'PROD-004',
            name: 'Coffee Maker',
            sku: 'CM-5000XL',
            category: 'Home Appliances',
            currentStock: 25,
            available: 22,
            reserved: 3,
            lowStockThreshold: 10,
            status: 'In Stock',
            location: 'D10-2',
            lastUpdated: '2023-11-12'
        },
        {
            id: 5,
            productId: 'PROD-005',
            name: 'Running Shoes',
            sku: 'RS-AM270-BLK',
            category: 'Footwear',
            currentStock: 120,
            available: 115,
            reserved: 5,
            lowStockThreshold: 20,
            status: 'In Stock',
            location: 'E15-3',
            lastUpdated: '2023-11-13'
        }
    ]);

    // State for modals and forms
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'productId', direction: 'ascending' });
    const [stockAdjustment, setStockAdjustment] = useState({
        type: 'add',
        quantity: '',
        reason: '',
        notes: ''
    });

    // Get unique categories for filter dropdown
    const categories = ['All', ...new Set(inventory.map(item => item.category))];

    // Add new inventory item
    const handleAddItem = (e) => {
        e.preventDefault();
        const form = e.target;
        const newItem = {
            id: inventory.length + 1,
            productId: form.elements.productId.value,
            name: form.elements.name.value,
            sku: form.elements.sku.value,
            category: form.elements.category.value,
            currentStock: parseInt(form.elements.currentStock.value),
            available: parseInt(form.elements.currentStock.value),
            reserved: 0,
            lowStockThreshold: parseInt(form.elements.lowStockThreshold.value),
            status: parseInt(form.elements.currentStock.value) > parseInt(form.elements.lowStockThreshold.value)
                ? 'In Stock'
                : parseInt(form.elements.currentStock.value) > 0
                    ? 'Low Stock'
                    : 'Out of Stock',
            location: form.elements.location.value,
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        setInventory([...inventory, newItem]);
        setShowAddModal(false);
    };

    // Edit inventory item
    const handleEditItem = (e) => {
        e.preventDefault();
        const form = e.target;
        const updatedItem = {
            ...currentItem,
            productId: form.elements.productId.value,
            name: form.elements.name.value,
            sku: form.elements.sku.value,
            category: form.elements.category.value,
            lowStockThreshold: parseInt(form.elements.lowStockThreshold.value),
            location: form.elements.location.value,
            status: currentItem.currentStock > parseInt(form.elements.lowStockThreshold.value)
                ? 'In Stock'
                : currentItem.currentStock > 0
                    ? 'Low Stock'
                    : 'Out of Stock'
        };
        setInventory(inventory.map(item => item.id === currentItem.id ? updatedItem : item));
        setShowEditModal(false);
    };

    // Adjust stock levels
    const handleAdjustStock = (e) => {
        e.preventDefault();
        const adjustment = stockAdjustment.type === 'add'
            ? parseInt(stockAdjustment.quantity)
            : -parseInt(stockAdjustment.quantity);

        const updatedItem = {
            ...currentItem,
            currentStock: currentItem.currentStock + adjustment,
            available: currentItem.available + (stockAdjustment.type === 'add'
                ? parseInt(stockAdjustment.quantity)
                : -parseInt(stockAdjustment.quantity)),
            status: currentItem.currentStock + adjustment > currentItem.lowStockThreshold
                ? 'In Stock'
                : currentItem.currentStock + adjustment > 0
                    ? 'Low Stock'
                    : 'Out of Stock',
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        setInventory(inventory.map(item => item.id === currentItem.id ? updatedItem : item));
        setShowStockModal(false);
        setStockAdjustment({
            type: 'add',
            quantity: '',
            reason: '',
            notes: ''
        });
    };

    // Delete inventory item
    const handleDeleteItem = (id) => {
        if (window.confirm('Are you sure you want to delete this inventory item?')) {
            setInventory(inventory.filter(item => item.id !== id));
        }
    };

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sort inventory
    const sortedInventory = [...inventory].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    // Filter inventory
    const filteredInventory = sortedInventory.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h2>Inventory Management</h2>
                <div className="inventory-actions">
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="add-item-btn"
                    >
                        + Add Item
                    </button>
                </div>
            </div>

            <div className="inventory-stats">
                <div className="stat-card">
                    <h3>Total Items</h3>
                    <p>{inventory.length}</p>
                </div>
                <div className="stat-card">
                    <h3>In Stock</h3>
                    <p>{inventory.filter(item => item.status === 'In Stock').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Low Stock</h3>
                    <p>{inventory.filter(item => item.status === 'Low Stock').length}</p>
                </div>
                <div className="stat-card warning">
                    <h3>Out of Stock</h3>
                    <p>{inventory.filter(item => item.status === 'Out of Stock').length}</p>
                </div>
            </div>

            <div className="table-responsive">
                <table className="inventory-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('productId')}>
                            Product ID {sortConfig.key === 'productId' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('name')}>
                            Product Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('sku')}>
                            SKU {sortConfig.key === 'sku' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('category')}>
                            Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('currentStock')}>
                            Stock {sortConfig.key === 'currentStock' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th>Available</th>
                        <th>Reserved</th>
                        <th onClick={() => handleSort('status')}>
                            Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('location')}>
                            Location {sortConfig.key === 'location' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredInventory.length > 0 ? (
                        filteredInventory.map(item => (
                            <tr key={item.id} className={`status-${item.status.toLowerCase().replace(' ', '-')}`}>
                                <td>{item.productId}</td>
                                <td>{item.name}</td>
                                <td>{item.sku}</td>
                                <td>{item.category}</td>
                                <td>
                                    {item.currentStock}
                                    {item.currentStock < item.lowStockThreshold && (
                                        <span className="threshold-warning"> (Threshold: {item.lowStockThreshold})</span>
                                    )}
                                </td>
                                <td>{item.available}</td>
                                <td>{item.reserved}</td>
                                <td>
                    <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                                </td>
                                <td>{item.location}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="adjust-stock"
                                            onClick={() => {
                                                setCurrentItem(item);
                                                setShowStockModal(true);
                                            }}
                                        >
                                            Adjust
                                        </button>
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
                                            onClick={() => handleDeleteItem(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10" className="no-results">No inventory items found</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Add Inventory Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Add New Inventory Item</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleAddItem}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product ID *</label>
                                        <input type="text" name="productId" required />
                                    </div>
                                    <div className="form-group">
                                        <label>SKU *</label>
                                        <input type="text" name="sku" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input type="text" name="name" required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <input type="text" name="category" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Initial Stock *</label>
                                        <input type="number" name="currentStock" min="0" required />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Low Stock Threshold *</label>
                                        <input type="number" name="lowStockThreshold" min="1" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Location *</label>
                                        <input type="text" name="location" required />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Add Item</button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Inventory Modal */}
            {showEditModal && currentItem && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Inventory Item</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleEditItem}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product ID *</label>
                                        <input
                                            type="text"
                                            name="productId"
                                            defaultValue={currentItem.productId}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>SKU *</label>
                                        <input
                                            type="text"
                                            name="sku"
                                            defaultValue={currentItem.sku}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={currentItem.name}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <input
                                            type="text"
                                            name="category"
                                            defaultValue={currentItem.category}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Low Stock Threshold *</label>
                                        <input
                                            type="number"
                                            name="lowStockThreshold"
                                            min="1"
                                            defaultValue={currentItem.lowStockThreshold}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Location *</label>
                                    <input
                                        type="text"
                                        name="location"
                                        defaultValue={currentItem.location}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Save Changes</button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Adjustment Modal */}
            {showStockModal && currentItem && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Adjust Stock: {currentItem.name}</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowStockModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleAdjustStock}>
                                <div className="stock-info">
                                    <div className="info-row">
                                        <span>Current Stock:</span>
                                        <span>{currentItem.currentStock}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Available:</span>
                                        <span>{currentItem.available}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Reserved:</span>
                                        <span>{currentItem.reserved}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Low Stock Threshold:</span>
                                        <span>{currentItem.lowStockThreshold}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Adjustment Type *</label>
                                    <select
                                        value={stockAdjustment.type}
                                        onChange={(e) => setStockAdjustment({...stockAdjustment, type: e.target.value})}
                                        required
                                    >
                                        <option value="add">Add Stock</option>
                                        <option value="remove">Remove Stock</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={stockAdjustment.quantity}
                                        onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Reason *</label>
                                    <select
                                        value={stockAdjustment.reason}
                                        onChange={(e) => setStockAdjustment({...stockAdjustment, reason: e.target.value})}
                                        required
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="purchase">Purchase Order</option>
                                        <option value="return">Customer Return</option>
                                        <option value="damage">Damaged Goods</option>
                                        <option value="loss">Inventory Loss</option>
                                        <option value="adjustment">Manual Adjustment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                        rows="3"
                                        value={stockAdjustment.notes}
                                        onChange={(e) => setStockAdjustment({...stockAdjustment, notes: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Confirm Adjustment</button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowStockModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;