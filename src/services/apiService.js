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
                const decoded = atob(payload);
                return JSON.parse(decoded);
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

export { userService, customerProfileService, organizationProfileService, productService };