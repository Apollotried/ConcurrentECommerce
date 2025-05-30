import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './customer.css';

const Customers = () => {
    const [customers, setCustomers] = useState([
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1 555-123-4567',
            joinDate: '2023-01-15',
            orders: 12,
            totalSpent: 2450.75,
            status: 'Active',
            lastActive: '2023-10-28',
            shippingAddress: '123 Main St, New York, NY 10001'
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1 555-987-6543',
            joinDate: '2022-11-05',
            orders: 5,
            totalSpent: 875.50,
            status: 'Active',
            lastActive: '2023-10-25',
            shippingAddress: '456 Oak Ave, Los Angeles, CA 90001'
        },
        {
            id: 3,
            firstName: 'Robert',
            lastName: 'Johnson',
            email: 'robert.j@example.com',
            phone: '+1 555-456-7890',
            joinDate: '2023-03-20',
            orders: 0,
            totalSpent: 0,
            status: 'Inactive',
            lastActive: '2023-05-15',
            shippingAddress: '789 Pine Rd, Chicago, IL 60601'
        }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 'Active',
        shippingAddress: ''
    });

    const handleAddCustomer = (e) => {
        e.preventDefault();
        const newCustomer = {
            id: customers.length + 1,
            ...formData,
            joinDate: new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString().split('T')[0],
            orders: 0,
            totalSpent: 0
        };
        setCustomers([...customers, newCustomer]);
        setShowAddModal(false);
        resetForm();
    };

    const handleEditCustomer = (e) => {
        e.preventDefault();
        const updatedCustomers = customers.map(customer =>
            customer.id === currentCustomer.id ? { ...customer, ...formData } : customer
        );
        setCustomers(updatedCustomers);
        setShowEditModal(false);
        resetForm();
    };

    const handleDeleteCustomer = (id) => {
        if (window.confirm('Are you sure you want to delete this customer? All their order history will be removed.')) {
            setCustomers(customers.filter(customer => customer.id !== id));
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedCustomers = [...customers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const filteredCustomers = sortedCustomers.filter(customer => {
        const matchesSearch =
            customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'All' || customer.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredCustomers.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            status: 'Active',
            shippingAddress: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditClick = (customer) => {
        setCurrentCustomer(customer);
        setFormData({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            status: customer.status,
            shippingAddress: customer.shippingAddress
        });
        setShowEditModal(true);
    };

    const handleDetailsClick = (customer) => {
        setCurrentCustomer(customer);
        setShowDetailsModal(true);
    };

    const handleStatusChange = (id, newStatus) => {
        setCustomers(customers.map(customer =>
            customer.id === id ? { ...customer, status: newStatus } : customer
        ));
    };

    return (
        <div className="customers-container">
            <div className="customers-header">
                <h2>Customers Management</h2>
                <div className="customers-actions">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Banned">Banned</option>
                    </select>
                    <button onClick={() => setShowAddModal(true)} className="add-customer-btn">
                        + Add Customer
                    </button>
                </div>
            </div>

            <div className="customers-stats">
                <div className="stat-card">
                    <h3>Total Customers</h3>
                    <p>{customers.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Customers</h3>
                    <p>{customers.filter(c => c.status === 'Active').length}</p>
                </div>
                <div className="stat-card">
                    <h3>New This Month</h3>
                    <p>{customers.filter(c => new Date(c.joinDate) > new Date(new Date().setMonth(new Date().getMonth() - 1))).length}</p>
                </div>
                <div className="stat-card">
                    <h3>Avg. Orders</h3>
                    <p>{(customers.reduce((acc, curr) => acc + curr.orders, 0) / customers.length || 0)}</p>
                </div>
            </div>

            <div className="table-responsive">
                <table className="customers-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('firstName')}>Name {sortConfig.key === 'firstName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('email')}>Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('phone')}>Phone {sortConfig.key === 'phone' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('orders')}>Orders {sortConfig.key === 'orders' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('totalSpent')}>Total Spent {sortConfig.key === 'totalSpent' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('status')}>Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('joinDate')}>Join Date {sortConfig.key === 'joinDate' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentRows.length > 0 ? (
                        currentRows.map((customer) => (
                            <tr key={customer.id}>
                                <td>{customer.id}</td>
                                <td>
                                    <div className="customer-name">
                                        {customer.firstName} {customer.lastName}
                                    </div>
                                </td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.orders}</td>
                                <td>${customer.totalSpent.toFixed(2)}</td>
                                <td>
                                    <select
                                        value={customer.status}
                                        onChange={(e) => handleStatusChange(customer.id, e.target.value)}
                                        className={`status-select ${customer.status.toLowerCase()}`}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Banned">Banned</option>
                                    </select>
                                </td>
                                <td>{customer.joinDate}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="view"
                                            onClick={() => handleDetailsClick(customer)}
                                        >
                                            Details
                                        </button>
                                        <button
                                            className="edit"
                                            onClick={() => handleEditClick(customer)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => handleDeleteCustomer(customer.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="no-results">No customers found</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredCustomers.length > rowsPerPage && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Add New Customer</h3>
                                <button className="close-btn" onClick={() => { setShowAddModal(false); resetForm(); }}>×</button>
                            </div>
                            <form onSubmit={handleAddCustomer}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Shipping Address</label>
                                    <textarea
                                        name="shippingAddress"
                                        rows="3"
                                        value={formData.shippingAddress}
                                        onChange={handleInputChange}
                                    ></textarea>
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
                                        <option value="Banned">Banned</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">Add Customer</button>
                                    <button type="button" className="cancel-btn" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {showEditModal && currentCustomer && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Customer</h3>
                                <button className="close-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>×</button>
                            </div>
                            <form onSubmit={handleEditCustomer}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Shipping Address</label>
                                    <textarea
                                        name="shippingAddress"
                                        rows="3"
                                        value={formData.shippingAddress}
                                        onChange={handleInputChange}
                                    ></textarea>
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
                                        <option value="Banned">Banned</option>
                                    </select>
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

            {/* Customer Details Modal */}
            {showDetailsModal && currentCustomer && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Customer Details</h3>
                                <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
                            </div>
                            <div className="customer-details">
                                <div className="detail-row">
                                    <span className="detail-label">Customer ID:</span>
                                    <span className="detail-value">{currentCustomer.id}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{currentCustomer.firstName} {currentCustomer.lastName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{currentCustomer.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Phone:</span>
                                    <span className="detail-value">{currentCustomer.phone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className={`detail-value status-badge ${currentCustomer.status.toLowerCase()}`}>
                                        {currentCustomer.status}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Join Date:</span>
                                    <span className="detail-value">{currentCustomer.joinDate}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Last Active:</span>
                                    <span className="detail-value">{currentCustomer.lastActive}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Total Orders:</span>
                                    <span className="detail-value">{currentCustomer.orders}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Total Spent:</span>
                                    <span className="detail-value">${currentCustomer.totalSpent.toFixed(2)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Shipping Address:</span>
                                    <span className="detail-value">{currentCustomer.shippingAddress}</span>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="view-orders-btn"
                                    onClick={() => navigate(`/admin/orders?customer=${currentCustomer.id}`)}
                                >
                                    View Orders
                                </button>
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;