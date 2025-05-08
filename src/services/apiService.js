import axios from 'axios';

// Base URL untuk API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Enhanced token handling functions
const tokenService = {
    setToken: (token) => {
        if (token) {
            const [header, payload, signature] = token.split('.');
            localStorage.setItem('token_header', header);
            localStorage.setItem('token_payload', payload);
            localStorage.setItem('token_signature', signature);
            localStorage.setItem('token', token);
            
            // Set Authorization header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Log token parts (development only)
            console.log('\n=== Stored JWT Token Parts ===');
            console.log('Header:', Buffer.from(header, 'base64').toString());
            console.log('Payload:', Buffer.from(payload, 'base64').toString());
            console.log('Signature:', signature);
        }
    },
    
    getToken: () => {
        const header = localStorage.getItem('token_header');
        const payload = localStorage.getItem('token_payload');
        const signature = localStorage.getItem('token_signature');
        
        if (header && payload && signature) {
            return `${header}.${payload}.${signature}`;
        }
        return null;
    },
    
    removeToken: () => {
        localStorage.removeItem('token_header');
        localStorage.removeItem('token_payload');
        localStorage.removeItem('token_signature');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    },
    
    getTokenPayload: () => {
        const payload = localStorage.getItem('token_payload');
        if (payload) {
            try {
                const decoded = JSON.parse(atob(payload));
                // Ensure we have the user ID in the sub claim
                if (!decoded.sub && decoded.id) {
                    decoded.sub = decoded.id;
                }
                return decoded;
            } catch (error) {
                console.error('Error decoding token payload:', error);
                return null;
            }
        }
        return null;
    }
};

// Menyimpan informasi user
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
const removeUser = () => localStorage.removeItem('user');

// Konfigurasi axios dengan token
const authHeader = () => {
    const token = tokenService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const userService = {
    // Add token service functions to userService
    getToken: tokenService.getToken,
    setToken: tokenService.setToken,
    removeToken: tokenService.removeToken,
    getTokenPayload: tokenService.getTokenPayload,

    register: async (email, password, role) => {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                email,
                password,
                role
            });
            
            if (res.data.token) {
                tokenService.setToken(res.data.token);
                setUser(res.data.user);
            }
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: 'Terjadi kesalahan saat register' };
        }
    },

    login: async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            
            if (res.data.token) {
                tokenService.setToken(res.data.token);
                setUser(res.data.user);
            }
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: 'Terjadi kesalahan saat login' };
        }
    },

    // Logout user
    logout: () => {
        try {
            tokenService.removeToken();
            removeUser();
        } catch (err) {
            throw err.response?.data || { message: 'Terjadi kesalahan saat logout' };
        }
    },

    // Mendapatkan semua users (admin only)
    getAllUsers: async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/users`, {
                headers: authHeader()
            });
            return res.data;
        } catch (err) {
            throw err.res?.data || { message: 'Terjadi kesalahan saat mengambil data users' };
        }
    },

    getProfile: async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/profile`, {
                headers: authHeader()
            });
            return res.data;
        } catch (err) {
            throw err.res?.data || { message: 'Terjadi kesalahan saat mengambil profil' };
        }
    },
    
    // Enhanced permission checking methods
    hasPermission: (permission) => {
        const payload = tokenService.getTokenPayload();
        return payload?.permissions?.includes(permission) || false;
    },
    
    // Cek apakah user sudah login
    isLoggedIn: () => {
        const token = tokenService.getToken();
        if (!token) return false;
        
        const payload = tokenService.getTokenPayload();
        if (!payload) return false;
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    },
    
    getUser: () => {
        return getUser();
    },
    
    // Mendapatkan user saat ini
    getCurrentUser: () => {
        return tokenService.getTokenPayload();
    },
    
    // Cek apakah user adalah admin
    isAdmin: () => {
        const payload = tokenService.getTokenPayload();
        return payload?.role === 'admin';
    },
    
    // Cek apakah user adalah organization
    isOrganization: () => {
        const payload = tokenService.getTokenPayload();
        return payload?.role === 'organization';
    },
    
    // Cek apakah user adalah customer
    isCustomer: () => {
        const payload = tokenService.getTokenPayload();
        return payload?.role === 'customer';
    },

    toggleUserStatus: async (userId) => {
        try {
            const response = await axios.put(`${API_URL}/auth/users/${userId}/toggle-status`, {}, {
                headers: authHeader()
            });
            return response.data;
        } catch (err) {
            throw err.response?.data || { message: 'Failed to toggle user status' };
        }
    }
};

const customerProfileService = {
    getCustomerProfileById: async () => {
        try {
            const res = await axios.get(`${API_URL}/customers/profile`, {
                headers: authHeader()
            });
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: 'Terjadi kesalahan saat mengambil profil' };
        }
    },

    createOrUpdateProfile: async (profileData) => {
        try {
            const res = await axios.post(`${API_URL}/customers/profile-user`, {
                full_name: profileData.full_name,
                phone: profileData.phone,
                address: profileData.address,
                delivery_instructions: profileData.delivery_instructions
            }, {
                headers: authHeader()
            });
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: 'Terjadi kesalahan saat memperbarui profil' };
        }
    }
};

const organizationProfileService = {
    getOrgProfileById: async () => {
        try {
            const response = await axios.get(`${API_URL}/organizations/profile-org`, {
                headers: authHeader()
            });
            return response.data;  // Mengembalikan response.data langsung
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching profile');
        }
    },

    createOrUpdateProfile: async (profileData) => {
        try {
            const response = await axios.post(`${API_URL}/organizations/profile-org-personalisasi`, profileData, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating profile');
        }
    }
};

const productService = {
    getAllProducts: async () => {
        try {
            const res = await axios.get(`${API_URL}/products/allproduct`);
            return res.data;
        } catch (err) {
            throw err.res?.data || { message: 'Terjadi kesalahan saat mengambil data produk' };
        }
    },

    getProductById: async (productId) => {
        try {
            const res = await axios.get(`${API_URL}/products/${productId}`);
            return res.data;
        } catch (err) {
            throw err.res?.data || { message: 'Terjadi kesalahan saat mengambil detail produk' };
        }
    }
};

const orderService = {
    createOrder: async (orderData) => {
        try {
            const response = await axios.post(`${API_URL}/orders`, orderData, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Order creation error:', error);
            throw error.response?.data || { message: 'Failed to create order' };
        }
    },

    getAllOrders: async () => {
        try {
            const response = await axios.get(`${API_URL}/orders`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Get all orders error:', error);
            throw error.response?.data || { message: 'Failed to retrieve orders' };
        }
    },

    getCustomerOrders: async (customerId) => {
        if (!customerId) {
            throw new Error('Customer ID is required');
        }
        try {
            const response = await axios.get(`${API_URL}/orders/customer/${customerId}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Get customer orders error:', error);
            throw error.response?.data || { message: 'Failed to retrieve customer orders' };
        }
    },

    getOrderById: async (orderId) => {
        try {
            const response = await axios.get(`${API_URL}/orders/${orderId}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Get order by ID error:', error);
            throw error.response?.data || { message: 'Failed to retrieve order details' };
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status }, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Update order status error:', error);
            throw error.response?.data || { message: 'Failed to update order status' };
        }
    },

    updatePaymentStatus: async (orderId, paymentStatus) => {
        try {
            const response = await axios.put(`${API_URL}/orders/${orderId}/payment`, { paymentStatus }, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Update payment status error:', error);
            throw error.response?.data || { message: 'Failed to update payment status' };
        }
    }
};

const cartService = {
    getCart: async () => {
        try {
            // Check if user is logged in
            if (!userService.isLoggedIn()) {
                throw new Error('User not logged in');
            }
            
            const response = await axios.get(`${API_URL}/cart`, {
                headers: authHeader()
            });
            
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to retrieve cart');
        }
            return response.data;
        } catch (error) {
            console.error('Get cart error:', error);
            // Provide more detailed error information
            const errorMessage = error.response?.data?.message || error.message || 'Failed to retrieve cart';
            throw { message: errorMessage, originalError: error };
        }
    },

    addToCart: async (productId, quantity) => {
        try {
            // Check if user is logged in
            if (!userService.isLoggedIn()) {
                throw new Error('User not logged in');
            }
            
            // Validate inputs
            if (!productId || !quantity || quantity <= 0) {
                throw new Error('Invalid product ID or quantity');
            }
            const response = await axios.post(`${API_URL}/cart/add`, {
                productId,
                quantity
            }, {
                headers: authHeader()
            });
            
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to add item to cart');
    }
            return response.data;
        } catch (error) {
            console.error('Add to cart error:', error);
            // Provide more detailed error information
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
            throw { message: errorMessage, originalError: error };
        }
    },

    updateCartQuantity: async (productId, quantity) => {
        try {
            // Check if user is logged in
            if (!userService.isLoggedIn()) {
                throw new Error('User not logged in');
            }
            
            // Validate inputs
            if (!productId || quantity === undefined || quantity < 0) {
                throw new Error('Invalid product ID or quantity');
            }
            const response = await axios.put(`${API_URL}/cart/update`, {
                productId,
                quantity
            }, {
                headers: authHeader()
            });
            
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to update cart quantity');
        }
            return response.data;
        } catch (error) {
            console.error('Update cart quantity error:', error);
            // Provide more detailed error information
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart quantity';
            throw { message: errorMessage, originalError: error };
        }
    },

    removeFromCart: async (productId) => {
        try {
            // Check if user is logged in
            if (!userService.isLoggedIn()) {
                throw new Error('User not logged in');
            }
            
            // Validate inputs
            if (!productId) {
                throw new Error('Invalid product ID');
            }
            const response = await axios.delete(`${API_URL}/cart/item/${productId}`, {
                headers: authHeader()
            });
            
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to remove item from cart');
        }
            return response.data;
        } catch (error) {
            console.error('Remove from cart error:', error);
            // Provide more detailed error information
            const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item from cart';
            throw { message: errorMessage, originalError: error };
        }
    },

    clearCart: async () => {
        try {
            // Check if user is logged in
            if (!userService.isLoggedIn()) {
                throw new Error('User not logged in');
            }
            const response = await axios.delete(`${API_URL}/cart/clear`, {
                    headers: authHeader()
            });
            
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to clear cart');
                }
            return response.data;
        } catch (error) {
            console.error('Clear cart error:', error);
            // Provide more detailed error information
            const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
            throw { message: errorMessage, originalError: error };
        }
    },

    validateCart: async () => {
        try {
            // Check if user is logged in
            if (!userService.isLoggedIn()) {
                throw new Error('User not logged in');
        }
            
            const response = await axios.get(`${API_URL}/cart/validate`, {
                headers: authHeader()
            });
            
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to validate cart');
        }
            return response.data;
        } catch (error) {
            console.error('Validate cart error:', error);
            // Provide more detailed error information
            const errorMessage = error.response?.data?.message || error.message || 'Failed to validate cart';
            throw { message: errorMessage, originalError: error };
        }
    }
};

const deliveryService = {
    createDelivery: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/deliveries`, data, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Create delivery error:', error.response?.data || error.message);
            throw error;
        }
    },

    getDeliveryById: async (deliveryId) => {
        try {
            const response = await axios.get(`${API_URL}/deliveries/${deliveryId}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Get delivery error:', error.response?.data || error.message);
            throw error;
        }
    },

    getDeliveryByOrder: async (orderId) => {
        try {
            const response = await axios.get(`${API_URL}/deliveries/order/${orderId}`, {
                    headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Get delivery by order error:', error.response?.data || error.message);
            throw error;
        }
    },

    updateDeliveryStatus: async (deliveryId, status) => {
        try {
            const response = await axios.put(
                `${API_URL}/deliveries/${deliveryId}/status`,
                { status },
                {
                    headers: authHeader()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Update delivery status error:', error.response?.data || error.message);
            throw error;
        }
    },

    getDriverDeliveries: async (driverName) => {
        try {
            const response = await axios.get(
                `${API_URL}/deliveries/driver/${driverName}`,
                {
                headers: authHeader()
        }
            );
            return response.data;
        } catch (error) {
            console.error('Get driver deliveries error:', error.response?.data || error.message);
            throw error;
    }
    },

    getAllDeliveries: async () => {
        try {
            const response = await axios.get(`${API_URL}/deliveries`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Get all deliveries error:', error.response?.data || error.message);
            throw error;
        }
    }
};

const replenishmentService = {
    createReplenishmentOrder: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/replenishments`, data, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Create replenishment order error:', error.response?.data || error.message);
            throw error;
        }
    },

    getReplenishmentStatus: async (locationId = null) => {
        try {
            // If locationId is not provided, get all replenishment status
            const url = locationId 
                ? `${API_URL}/replenishments/status/${locationId}` 
                : `${API_URL}/replenishments/low-stock`;
                
            const response = await axios.get(url, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Get replenishment status error:', error.response?.data || error.message);
            throw error;
        }
    },

    updateStockLevels: async (locationId, productId, currentLevel, targetLevel) => {
        try {
            const response = await axios.put(
                `${API_URL}/replenishments/stock/${locationId}/${productId}`,
                { currentLevel, targetLevel },
                {
                    headers: authHeader()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Update stock levels error:', error.response?.data || error.message);
            throw error;
        }
    },

    getLowStockItems: async (locationId = null) => {
        try {
            const params = locationId ? `?locationId=${locationId}` : '';
            const response = await axios.get(`${API_URL}/replenishments/low-stock${params}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Get low stock items error:', error.response?.data || error.message);
            throw error;
        }
    },

    getStockOutHistory: async (locationId, startDate = null, endDate = null) => {
        try {
            let params = '';
            if (startDate) params += `?startDate=${startDate}`;
            if (endDate) params += `${params ? '&' : '?'}endDate=${endDate}`;
            const response = await axios.get(
                `${API_URL}/replenishments/stock-out/${locationId}${params}`,
                {
                    headers: authHeader()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Get stock out history error:', error.response?.data || error.message);
            throw error;
        }
    },

    completeReplenishmentOrder: async (replenishmentId) => {
        try {
            const response = await axios.put(
                `${API_URL}/replenishments/${replenishmentId}/complete`,
                {},
                {
                    headers: authHeader()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Complete replenishment order error:', error.response?.data || error.message);
            throw error;
        }
    }
};

const notificationService = {
    getUserNotifications: async () => {
        try {
            const response = await axios.get(`${API_URL}/notifications/user`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get notifications' };
        }
    },

    getLocationNotifications: async (locationId) => {
        try {
            const response = await axios.get(`${API_URL}/notifications/location/${locationId}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get location notifications' };
        }
    }
};

export { 
    userService, 
    customerProfileService, 
    organizationProfileService, 
    productService, 
    orderService,
    cartService,
    deliveryService,
    replenishmentService,
    notificationService 
};