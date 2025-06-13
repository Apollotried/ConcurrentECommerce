import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    fetchUserOrders,
    fetchOrderDetails,
    cancelOrder
} from '../api/orderApi.js';
import { format } from 'date-fns';
import Navbar from "../navbar/NavBar.jsx";

const statusColors = {
    PENDING: 'default',
    CONFIRMED: 'primary',
    RESERVED: 'secondary',
    SHIPPED: 'info',
    CANCELLED: 'error',
    FAILED: 'error',
    PAID: 'success'
};

const OrdersHistory = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const data = await fetchUserOrders();
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const handleViewDetails = async (orderId) => {
        try {
            const orderDetails = await fetchOrderDetails(orderId);
            setSelectedOrder(orderDetails);
            setOpenDialog(true);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await cancelOrder(orderId);
            // Refresh orders after cancellation
            const updatedOrders = await fetchUserOrders();
            setOrders(updatedOrders);
        } catch (error) {
            console.error('Failed to cancel order:', error);
        }
    };

    return (
        <>
            <Navbar />
            <div style={{padding: '20px'}}>
                <Typography variant="h4" gutterBottom>
                    My Orders
                </Typography>

                {loading ? (
                    <Typography>Loading orders...</Typography>
                ) : orders.length === 0 ? (
                    <Typography>No orders found</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id.substring(0, 8)}...</TableCell>
                                        <TableCell>
                                            {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                color={statusColors[order.status] || 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            ${order.items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleViewDetails(order.id)}
                                                sx={{mr: 1}}
                                            >
                                                Details
                                            </Button>
                                            {order.status === 'PENDING' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleCancelOrder(order.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Order Details Dialog */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
                    {selectedOrder && (
                        <>
                            <DialogTitle>
                                Order Details - {selectedOrder.id}
                            </DialogTitle>
                            <DialogContent dividers>
                                <Typography variant="h6" gutterBottom>
                                    Items
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell>Price</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Subtotal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.items.map((item) => (
                                                <TableRow key={item.productId}>
                                                    <TableCell>{item.productName}</TableCell>
                                                    <TableCell>${item.productPrice.toFixed(2)}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>${(item.productPrice * item.quantity).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Typography variant="h6" gutterBottom sx={{mt: 3}}>
                                    Summary
                                </Typography>
                                <Typography>
                                    <strong>Status:</strong> <Chip
                                    label={selectedOrder.status}
                                    color={statusColors[selectedOrder.status] || 'default'}
                                />
                                </Typography>
                                <Typography>
                                    <strong>Order
                                        Date:</strong> {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}
                                </Typography>
                                <Typography>
                                    <strong>Total:</strong> ${selectedOrder.items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0).toFixed(2)}
                                </Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenDialog(false)}>Close</Button>
                                {selectedOrder.status === 'PENDING' && (
                                    <Button
                                        onClick={() => {
                                            handleCancelOrder(selectedOrder.id);
                                            setOpenDialog(false);
                                        }}
                                        color="error"
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </div>
        </>
    );
};

export default OrdersHistory;