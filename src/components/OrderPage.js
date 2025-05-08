import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderService, productService, userService, cartService, deliveryService } from '../services/apiService';
import '../style/orderPage.css';

const OrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const [deliveryStatus, setDeliveryStatus] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = userService.getCurrentUser();
                if (!user || !user.user_id) {
                    navigate('/registration-or-login');
                    return;
                }

                // Load products first
                const productsData = await productService.getAllProducts();
                if (productsData.status === 'success') {
                    setProducts(productsData.data);
                }
                
                try {
                    // Try to get orders
                    const ordersData = await orderService.getCustomerOrders(user.user_id);
                    if (ordersData.status === 'success') {
                        setOrders(ordersData.data);
                }
                } catch (orderErr) {
                    console.error('Error fetching orders:', orderErr);
                    // Don't set error state here, just log it
                }
                
                try {
                    // Try to get cart
            const cartData = await cartService.getCart();
                    if (cartData.status === 'success') {
                        setCartItems(cartData.data.items || []);
                        setCartTotal(cartData.data.total || 0);
        }
                } catch (cartErr) {
                    console.error('Error fetching cart:', cartErr);
                    // Don't set error state here, just log it
                }

                // Set selected product if passed from dashboard
                if (location.state?.selectedProduct) {
                    setSelectedProduct(location.state.selectedProduct.product_id.toString());
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Gagal memuat data. Silakan coba lagi.');
                setLoading(false);
            }
    };

        fetchData();
    }, [location.state, navigate]);

    const handleAddToCart = async () => {
        if (!selectedProduct || quantity <= 0) {
            setError('Pilih produk dan jumlah yang valid');
                return;
            }

        try {
            await cartService.addToCart(parseInt(selectedProduct), quantity);
        try {
            const cartData = await cartService.getCart();
            setCartItems(cartData.data.items || []);
            setCartTotal(cartData.data.total || 0);
                setError(null);
                
                // Reset form
                setSelectedProduct('');
                setQuantity(1);
            } catch (cartErr) {
                console.error('Error fetching updated cart:', cartErr);
                // Don't set error here as the add operation was successful
        }
        } catch (error) {
            console.error('Error adding to cart:', error);
            setError(error.message || 'Gagal menambahkan ke keranjang. Silakan coba lagi.');
        }
    };

    const handleUpdateQuantity = async (productId, quantity) => {
        try {
            await cartService.updateCartQuantity(productId, quantity);
            const cartData = await cartService.getCart();
            setCartItems(cartData.data.items || []);
            setCartTotal(cartData.data.total || 0);
        } catch (error) {
            console.error('Error updating quantity:', error);
            setError(error.message || 'Gagal memperbarui jumlah');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await cartService.removeFromCart(productId);
            const cartData = await cartService.getCart();
            setCartItems(cartData.data.items || []);
            setCartTotal(cartData.data.total || 0);
        } catch (error) {
            console.error('Error removing item:', error);
            setError(error.message || 'Gagal menghapus item');
        }
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            setError('Keranjang belanja kosong. Tambahkan produk terlebih dahulu.');
            return;
        }
        
        try {
            const user = userService.getCurrentUser();
            if (!user || !user.user_id) {
                navigate('/registration-or-login');
                return;
            }

            const orderData = {
                scheduled_delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day delivery
                payment_method: paymentMethod,
                notes: notes
            };

            const response = await orderService.createOrder(orderData);
            
            if (response.status === 'success') {
                try {
                    // Try to get delivery status
                    const deliveryResponse = await deliveryService.getDeliveryByOrder(response.data.order.order_id);
                    if (deliveryResponse.status === 'success') {
                        setDeliveryInfo(deliveryResponse.data);
                        setDeliveryStatus(deliveryResponse.data.delivery_status);
                    }
                } catch (deliveryErr) {
                    console.error('Error fetching delivery:', deliveryErr);
                    // Don't set error state here, just log it
                }

                // Refresh orders list
                try {
                    const ordersData = await orderService.getCustomerOrders(user.user_id);
                    if (ordersData.status === 'success') {
                        setOrders(ordersData.data);
                    }
                } catch (orderErr) {
                    console.error('Error refreshing orders:', orderErr);
                }
                
                // Clear form
                setSelectedProduct('');
                setQuantity(1);
                setNotes('');
                setError(null);
                
                // Show success message
                alert('Pesanan berhasil dibuat!');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            setError(error.message || 'Gagal membuat pesanan. Silakan coba lagi.');
        }
    };

    // Function to get the total for the selected product in the add-to-cart form
    const getSelectedProductTotal = () => {
        if (!selectedProduct) return 0;
        const product = products.find(p => p.product_id.toString() === selectedProduct);
        return product ? product.unit_price * quantity : 0;
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="order-page">
            <h2>Buat Pesanan Baru</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div className="cart-section">
                <h3>Keranjang Belanja</h3>
                {cartItems.length === 0 ? (
                    <p>Keranjang belanja kosong</p>
                ) : (
                    <>
                        {cartItems.map(item => (
                            <div key={item.product_id} className="cart-item">
                                <span>{item.container_type}</span>
                                <div className="quantity-controls">
                                    <button onClick={() => handleUpdateQuantity(item.product_id, Math.max(1, item.quantity - 1))}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}>+</button>
                                </div>
                                <span>Rp {(item.quantity * item.unit_price).toLocaleString()}</span>
                                <button onClick={() => handleRemoveItem(item.product_id)} className="remove-button">Hapus</button>
                            </div>
                        ))}
                        <div className="cart-total">
                            <strong>Total: Rp {cartTotal.toLocaleString()}</strong>
                        </div>
                    </>
                )}
            </div>

            <div className="add-to-cart-form">
                <h3>Tambah Produk ke Keranjang</h3>
                <div className="form-group">
                    <label>Pilih Produk:</label>
                    <select 
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                        <option value="">Pilih produk</option>
                        {products.map(product => (
                            <option key={product.product_id} value={product.product_id}>
                                {product.container_type} - Rp {product.unit_price.toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Jumlah:</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                </div>

                {selectedProduct && (
                <div className="product-total">
                    Total: Rp {getSelectedProductTotal().toLocaleString()}
                </div>
                    )}

                <button type="button" onClick={handleAddToCart} className="add-to-cart-button">
                    Tambah ke Keranjang
                </button>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
                <h3>Checkout</h3>
                <div className="form-group">
                    <label>Metode Pembayaran:</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                    >
                        <option value="cash">Tunai</option>
                        <option value="transfer">Transfer Bank</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Catatan:</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tambahkan instruksi khusus di sini"
                    />
                </div>

                <button type="submit" className="submit-button" disabled={cartItems.length === 0}>
                    Buat Pesanan
                </button>
            </form>

            <h2>Pesanan Anda</h2>
            <div className="orders-list">
                {orders.length === 0 ? (
                    <p>Belum ada pesanan</p>
                ) : (
                    orders.map(order => (
                        <div key={order.order_id} className="order-card">
                            <div className="order-header">
                                <span>Order #{order.order_id}</span>
                                <span className={`status ${order.status}`}>{order.status}</span>
                            </div>
                            <div className="order-details">
                                <p>Tanggal: {new Date(order.order_date).toLocaleDateString()}</p>
                                <p>Total: Rp {order.total_amount.toLocaleString()}</p>
                                <p>Pembayaran: {order.payment_method}</p>
                                <p>Status Pembayaran: {order.payment_status}</p>
                                {order.notes && <p>Catatan: {order.notes}</p>}
                                
                                {order.items && order.items.length > 0 && (
                                    <div className="order-items">
                                        <h4>Produk:</h4>
                                        <ul>
                                            {order.items.map(item => (
                                                <li key={item.product_id}>
                                                    {item.container_type} x {item.quantity} = Rp {(item.unit_price * item.quantity).toLocaleString()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {deliveryInfo && (
                <div className="delivery-status">
                    <h3>Status Pengiriman</h3>
                    <p>Status: {deliveryStatus}</p>
                    {deliveryInfo.driver_name && (
                        <p>Driver: {deliveryInfo.driver_name}</p>
                    )}
                    {deliveryInfo.actual_delivery_time && (
                        <p>Delivered at: {new Date(deliveryInfo.actual_delivery_time).toLocaleString()}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderPage;