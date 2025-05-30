import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './category.css';

const Categories = () => {
    const [categories, setCategories] = useState([
        { id: 1, name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', parentId: null, status: 'Active', image: 'https://via.placeholder.com/50', createdAt: '2023-01-15' },
        { id: 2, name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items', parentId: null, status: 'Active', image: 'https://via.placeholder.com/50', createdAt: '2023-02-20' },
        { id: 3, name: 'Laptops', slug: 'laptops', description: 'Portable computers', parentId: 1, status: 'Active', image: 'https://via.placeholder.com/50', createdAt: '2023-03-10' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const navigate = useNavigate();

    // Form state for add/edit
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        status: 'Active',
        image: ''
    });

    const parentCategories = categories.filter(cat => cat.parentId === null);

    const handleAddCategory = (e) => {
        e.preventDefault();
        const newCategory = {
            id: categories.length + 1,
            ...formData,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setCategories([...categories, newCategory]);
        setShowAddModal(false);
        resetForm();
    };

    const handleEditCategory = (e) => {
        e.preventDefault();
        const updatedCategories = categories.map(cat =>
            cat.id === currentCategory.id ? { ...cat, ...formData } : cat
        );
        setCategories(updatedCategories);
        setShowEditModal(false);
        resetForm();
    };

    const handleDeleteCategory = (id) => {
        if (window.confirm('Are you sure you want to delete this category? Products in this category will need to be reassigned.')) {
            setCategories(categories.filter(cat => cat.id !== id));
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedCategories = [...categories].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const filteredCategories = sortedCategories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'All' || category.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            parentId: '',
            status: 'Active',
            image: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditClick = (category) => {
        setCurrentCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description,
            parentId: category.parentId || '',
            status: category.status,
            image: category.image
        });
        setShowEditModal(true);
    };

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h2>Categories Management</h2>
                <div className="categories-actions">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <button onClick={() => setShowAddModal(true)} className="add-category-btn">
                        + Add Category
                    </button>
                </div>
            </div>

            <div className="categories-stats">
                <div className="stat-card">
                    <h3>Total Categories</h3>
                    <p>{categories.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Categories</h3>
                    <p>{categories.filter(c => c.status === 'Active').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Subcategories</h3>
                    <p>{categories.filter(c => c.parentId !== null).length}</p>
                </div>
            </div>

            <div className="table-responsive">
                <table className="categories-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th>Image</th>
                        <th onClick={() => handleSort('name')}>Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('parentId')}>Parent {sortConfig.key === 'parentId' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th>Description</th>
                        <th onClick={() => handleSort('status')}>Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td><img src={category.image || 'https://via.placeholder.com/50'} alt={category.name} className="category-image" /></td>
                                <td>
                                    <div className="category-name">{category.name}</div>
                                    <div className="category-slug">{category.slug}</div>
                                </td>
                                <td>
                                    {category.parentId ?
                                        categories.find(c => c.id === category.parentId)?.name || 'N/A' :
                                        '—'}
                                </td>
                                <td className="description-cell">{category.description}</td>
                                <td>
                                        <span className={`status-badge ${category.status.toLowerCase()}`}>
                                            {category.status}
                                        </span>
                                </td>
                                <td>{category.createdAt}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="edit" onClick={() => handleEditClick(category)}>Edit</button>
                                        <button className="delete" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                                        <button className="view" onClick={() => navigate(`/admin/products?category=${category.id}`)}>View Products</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="no-results">No categories found</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Add New Category</h3>
                                <button className="close-btn" onClick={() => { setShowAddModal(false); resetForm(); }}>×</button>
                            </div>
                            <form onSubmit={handleAddCategory}>
                                <div className="form-group">
                                    <label>Category Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>URL Slug *</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Parent Category</label>
                                        <select
                                            name="parentId"
                                            value={formData.parentId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">None (Main Category)</option>
                                            {parentCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status *</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        placeholder="Leave empty for default"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Add Category</button>
                                    <button type="button" className="cancel-btn" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && currentCategory && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Category</h3>
                                <button className="close-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>×</button>
                            </div>
                            <form onSubmit={handleEditCategory}>
                                <div className="form-group">
                                    <label>Category Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>URL Slug *</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Parent Category</label>
                                        <select
                                            name="parentId"
                                            value={formData.parentId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">None (Main Category)</option>
                                            {parentCategories.filter(cat => cat.id !== currentCategory.id).map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status *</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Save Changes</button>
                                    <button type="button" className="cancel-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;