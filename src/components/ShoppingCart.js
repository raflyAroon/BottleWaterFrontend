import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, userService } from '../services/apiService';
import '../style/shoppingCart.css';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            try {
                if (!userService.isLoggedIn()) {
                    navigate('/registration-or-login');
                    return;
                }

                const response = await cartService.getCart();
                if (response.status === 'success') {
                    setCartItems(response.data.items || []);
                    setCartTotal(response.data.total || 0);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cart:', error);
                setError(error.message || 'Failed to load cart');
                setLoading(false);
            }
        };

        fetchCart();
    }, [navigate]);

    const handleUpdateQuantity = async (productId, quantity) => {
        try {
            await cartService.updateCartQuantity(productId, quantity);
            const response = await cartService.getCart();
            if (response.status === 'success') {
                setCartItems(response.data.items || []);
                setCartTotal(response.data.total || 0);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            setError(error.message || 'Failed to update quantity');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await cartService.removeFromCart(productId);
            const response = await cartService.getCart();
            if (response.status === 'success') {
                setCartItems(response.data.items || []);
                setCartTotal(response.data.total || 0);
            }
        } catch (error) {
            console.error('Error removing item:', error);
            setError(error.message || 'Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        try {
            await cartService.clearCart();
            setCartItems([]);
            setCartTotal(0);
        } catch (error) {
            console.error('Error clearing cart:', error);
            setError(error.message || 'Failed to clear cart');
        }
    };

    const handleCheckout = () => {
        navigate('/orders');
    };

    if (loading) {
        return <div className="loading">Loading cart...</div>;
    }

    return (
        <div className="shopping-cart">
            <h2>Shopping Cart</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty</p>
                    <button onClick={() => navigate('/dashboard')} className="continue-shopping">
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.product_id} className="cart-item">
                                <div className="item-image">
                                    <img 
                                        src={item.image_url || `https://via.placeholder.com/100?text=${item.container_type}`} 
                                        alt={item.container_type} 
                                    />
                                </div>
                                <div className="item-details">
                                    <h3>{item.container_type}</h3>
                                    <p>{item.description}</p>
                                    <p className="item-price">Rp {item.unit_price.toLocaleString()} per unit</p>
                                </div>
                                <div className="item-quantity">
                                    <button 
                                        onClick={() => handleUpdateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                                        className="quantity-btn"
                                    >
                                        -
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="item-total">
                                    Rp {(item.quantity * item.unit_price).toLocaleString()}
                                </div>
                                <button 
                                    onClick={() => handleRemoveItem(item.product_id)}
                                    className="remove-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="cart-summary">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span>Rp {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="cart-actions">
                            <button onClick={handleClearCart} className="clear-cart-btn">
                                Clear Cart
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="continue-shopping">
                                Continue Shopping
                            </button>
                            <button onClick={handleCheckout} className="checkout-btn">
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShoppingCart;