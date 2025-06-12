import React, { useState, useEffect, useCallback } from 'react';
import './Customer.css';
import {
    fetchAllCustomers,
    fetchCustomerCounts,
    deleteCustomer,
    updateCustomer,
    createCustomer
} from '../api/customerApi';
import {showErrorToast, showSuccessToast} from "../utils/toast.jsx";

const Customers = () => {
    // State management
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);

    const [filters, setFilters] = useState({
        searchTerm: '',
        sortBy: 'createdAt',
        sortDirection: 'desc'
    });

    // Form states
    const [newCustomer, setNewCustomer] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    const [editCustomer, setEditCustomer] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    const [counts, setCounts] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        newThisMonth: 0
    });

    // Data loading
    const loadCustomers = useCallback(async () => {
        try {
            const customerData = await fetchAllCustomers(
                currentPage,
                size,
                filters.sortBy,
                filters.sortDirection,
                filters.searchTerm
            );
            setCustomers(customerData.content);
            setTotalPages(customerData.totalPages);
        } catch (error) {
            console.error("Error fetching customers:", error);
            showErrorToast("Failed to load customers");
        }
    }, [currentPage, size, filters]);

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                loadCustomers(),
                fetchCustomerCounts().then(counts => {
                    setCounts({
                        total: counts.total,
                        newThisMonth: counts.newThisMonth
                    });
                })
            ]);
        };
        loadInitialData();
    }, [loadCustomers]);

    // Handlers
    const handleSort = (key) => {
        setFilters(prev => ({
            ...prev,
            sortBy: key,
            sortDirection: prev.sortBy === key && prev.sortDirection === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        setCurrentPage(0);
    };

    const handleAddCustomer = async () => {
        try {
            await createCustomer(newCustomer);
            await loadCustomers();

            const counts = await fetchCustomerCounts();
            setCounts({
                total: counts.total,
                newThisMonth: counts.newThisMonth,
                active: 0,
                inactive: 0
            });


            setShowAddModal(false);
            setNewCustomer({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
            });

            showSuccessToast("Customer added successfully");
        } catch (error) {
            console.error('Error adding customer:', error);
            showErrorToast(error.response?.data?.message || "Failed to add customer");
        }
    };

    const handleUpdateCustomer = async () => {
        try {
            await updateCustomer(currentCustomer.id, editCustomer);
            await loadCustomers();


            const counts = await fetchCustomerCounts();
            setCounts({
                total: counts.total,
                newThisMonth: counts.newThisMonth,
                active: 0,
                inactive: 0
            });


            setShowEditModal(false);
            showSuccessToast("Customer updated successfully");
        } catch (error) {
            console.error('Error updating customer:', error);
            showErrorToast(error.response?.data?.message || "Failed to update customer");
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await deleteCustomer(customerId);



                const counts = await fetchCustomerCounts();
                setCounts({
                    total: counts.total,
                    newThisMonth: counts.newThisMonth,
                    active: 0,
                    inactive: 0
                });



                await loadCustomers();
                showSuccessToast("Customer deleted successfully");
            } catch (error) {
                console.error('Error deleting customer:', error);
                showErrorToast(error.response?.data?.message || "Failed to delete customer");
            }
        }
    };

    const handleEditClick = (customer) => {
        setCurrentCustomer(customer);
        setEditCustomer({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
        });
        setShowEditModal(true);
    };

    return (
        <div className="customer-container">
            <div className="customer-header">
                <h2>Customer Management</h2>
                <div className="customer-actions">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="add-customer-btn"
                    >
                        + Add Customer
                    </button>
                </div>
            </div>

            <div className="customer-stats">
                <div className="stat-card">
                    <h3>Total Customers</h3>
                    <p>{counts.total}</p>
                </div>
                <div className="stat-card">
                    <h3>New This Month</h3>
                    <p>{counts.newThisMonth}</p>
                </div>
            </div>

            <div className="table-responsive">
                <table className="customer-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>
                            ID {filters.sortBy === 'id' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('firstName')}>
                            Name {filters.sortBy === 'firstName' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('email')}>
                            Email {filters.sortBy === 'email' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('registrationDate')}>
                            Registered {filters.sortBy === 'registrationDate' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('lastLogin')}>
                            Last Login {filters.sortBy === 'lastLogin' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('totalOrders')}>
                            Orders {filters.sortBy === 'totalOrders' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('totalSpent')}>
                            Total
                            Spent {filters.sortBy === 'totalSpent' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {customers.length > 0 ? (
                        customers.map(customer => (
                            <tr key={customer.id}>
                                <td>{customer.id}</td>
                                <td>{customer.firstName} {customer.lastName}</td>
                                <td>{customer.email}</td>
                                <td>{new Date(customer.registrationDate).toLocaleDateString()}</td>
                                <td>{customer.lastLogin ? new Date(customer.lastLogin).toLocaleString() : 'Never'}</td>
                                <td>{customer.totalOrders}</td>
                                <td>${customer.totalSpent.toFixed(2)}</td>
                                <td>
                            <span className={`status-badge ${customer.active ? 'active' : 'inactive'}`}>
                                {customer.active ? 'Active' : 'Inactive'}
                            </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
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

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add New Customer</h3>
                            <button onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        value={newCustomer.firstName}
                                        onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        value={newCustomer.lastName}
                                        onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button
                                onClick={handleAddCustomer}
                                className="primary"
                                disabled={!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email}
                            >
                                Add Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {showEditModal && currentCustomer && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit Customer</h3>
                            <button onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        value={editCustomer.firstName}
                                        onChange={(e) => setEditCustomer({...editCustomer, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        value={editCustomer.lastName}
                                        onChange={(e) => setEditCustomer({...editCustomer, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={editCustomer.email}
                                    onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={editCustomer.phone}
                                    onChange={(e) => setEditCustomer({...editCustomer, phone: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button
                                onClick={handleUpdateCustomer}
                                className="primary"
                                disabled={!editCustomer.firstName || !editCustomer.lastName || !editCustomer.email}
                            >
                                Update Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;