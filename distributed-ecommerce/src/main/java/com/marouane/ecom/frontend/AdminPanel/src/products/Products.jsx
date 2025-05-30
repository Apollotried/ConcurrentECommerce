import React, { useState, useEffect } from 'react';
import './products.css';

function Products() {
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'MacBook Pro',
            category: 'Electronics',
            price: 1999,
            stock: 20,
            status: 'Active',
            image: 'https://via.placeholder.com/50',
            description: 'Apple MacBook Pro with M1 chip',
            sku: 'MBP-M1-2023',
            createdAt: '2023-05-15'
        },
        {
            id: 2,
            name: 'Nike Air Max',
            category: 'Shoes',
            price: 129,
            stock: 50,
            status: 'Active',
            image: 'https://via.placeholder.com/50',
            description: 'Comfortable running shoes',
            sku: 'NIKE-AM-270',
            createdAt: '2023-06-20'
        },
        {
            id: 3,
            name: 'Coffee Maker',
            category: 'Home Appliances',
            price: 89,
            stock: 10,
            status: 'Inactive',
            image: 'https://via.placeholder.com/50',
            description: '12-cup programmable coffee maker',
            sku: 'CM-1200-XL',
            createdAt: '2023-04-10'
        }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    // Get unique categories for filter dropdown
    const categories = ['All', ...new Set(products.map(product => product.category))];

    const handleAddProduct = (e) => {
        e.preventDefault();
        const form = e.target;
        const newProduct = {
            id: products.length + 1,
            name: form.elements.name.value,
            category: form.elements.category.value,
            price: parseFloat(form.elements.price.value),
            stock: parseInt(form.elements.stock.value),
            status: form.elements.status.value,
            image: form.elements.image.value || 'https://via.placeholder.com/50',
            description: form.elements.description.value,
            sku: form.elements.sku.value,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setProducts([...products, newProduct]);
        setShowAddModal(false);
    };

    const handleEditProduct = (e) => {
        e.preventDefault();
        const form = e.target;
        const updatedProduct = {
            ...currentProduct,
            name: form.elements.name.value,
            category: form.elements.category.value,
            price: parseFloat(form.elements.price.value),
            stock: parseInt(form.elements.stock.value),
            status: form.elements.status.value,
            image: form.elements.image.value,
            description: form.elements.description.value,
            sku: form.elements.sku.value
        };
        setProducts(products.map(product => product.id === currentProduct.id ? updatedProduct : product));
        setShowEditModal(false);
    };

    const handleDeleteProduct = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(product => product.id !== id));
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedProducts = [...products].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const filteredProducts = sortedProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="products-container">
            <div className="products-header">
                <h2>Product Management</h2>
                <div className="products-actions">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <button onClick={() => setShowAddModal(true)} className="add-product-btn">
                        + Add Product
                    </button>
                </div>
            </div>

            <div className="products-stats">
                <div className="stat-card">
                    <h3>Total Products</h3>
                    <p>{products.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Products</h3>
                    <p>{products.filter(p => p.status === 'Active').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Low Stock (&lt;5)</h3>
                    <p>{products.filter(p => p.stock < 5).length}</p>
                </div>
            </div>

            <div className="table-responsive">
                <table className="products-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th>Image</th>
                        <th onClick={() => handleSort('name')}>Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('category')}>Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('price')}>Price {sortConfig.key === 'price' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('stock')}>Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('status')}>Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th>SKU</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <tr key={product.id} className={product.stock < 5 ? 'low-stock' : ''}>
                                <td>{product.id}</td>
                                <td><img src={product.image} alt={product.name} className="product-image" /></td>
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
                                <td>{product.sku}</td>
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
                                            onClick={() => handleDeleteProduct(product.id)}
                                        >
                                            Delete
                                        </button>


                                          <button className="view">View</button>
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
                                    <input type="text" name="name" required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" name="category" required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input type="number" name="price" step="0.01" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock Quantity</label>
                                        <input type="number" name="stock" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" required>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>SKU</label>
                                    <input type="text" name="sku" required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="3"></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input type="text" name="image" placeholder="Leave empty for default" />
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Add Product</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
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
                                    <input type="text" name="name" defaultValue={currentProduct.name} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" name="category" defaultValue={currentProduct.category} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input type="number" name="price" step="0.01" defaultValue={currentProduct.price} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock Quantity</label>
                                        <input type="number" name="stock" defaultValue={currentProduct.stock} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" defaultValue={currentProduct.status} required>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>SKU</label>
                                    <input type="text" name="sku" defaultValue={currentProduct.sku} required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="3" defaultValue={currentProduct.description}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input type="text" name="image" defaultValue={currentProduct.image} />
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