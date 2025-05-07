import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, productService } from '../services/apiService';
import '../style/dashboard.css';
import axios from 'axios';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [customerProfiles, setCustomerProfiles] = useState([]);
    const [orgProfiles, setOrgProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const isLoggedIn = userService.isLoggedIn();

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!userService.isAdmin()) {
                    const productsResponse = await productService.getAllProducts();
                    setProducts(productsResponse.data);
                }

                if (isLoggedIn) {
                    const userResult = await userService.getProfile();
                    setUser(userResult.data);

                    if (userService.isAdmin()) {
                        const usersResponse = await userService.getAllUsers();
                        setUsers(usersResponse.data);
                        
                        // Fetch customer and organization profiles for admin using the correct endpoints
                        const customersResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/customers/profiles`, {
                            headers: { Authorization: `Bearer ${userService.getToken()}` }
                        });
                        setCustomerProfiles(customersResponse.data.data);

                        const orgsResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/organizations/all-profiles-org`, {
                            headers: { Authorization: `Bearer ${userService.getToken()}` }
                        });
                        setOrgProfiles(orgsResponse.data.data);
                    }
                }
            } catch (error) {
                setError(error.message || 'Failed to load data');
                if (error.response?.status === 401 && isLoggedIn) {
                    userService.logout();
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isLoggedIn]);

    const handleToggleUserStatus = async (user) => {
        try {
            await userService.toggleUserStatus(user.user_id);
            // Refresh all data after toggle
            const usersResponse = await userService.getAllUsers();
            setUsers(usersResponse.data);
            
            // Also refresh profiles data using correct endpoints
            const customersResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/customers/profiles`, {
                headers: { Authorization: `Bearer ${userService.getToken()}` }
            });
            setCustomerProfiles(customersResponse.data.data);

            const orgsResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/organizations/all-profiles-org`, {
                headers: { Authorization: `Bearer ${userService.getToken()}` }
            });
            setOrgProfiles(orgsResponse.data.data);
        } catch (error) {
            setError(error.message || 'Failed to toggle user status');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading...</div>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    const handleOrder = (product) => {
        console.log('Ordering product:', product);
    };

    const getDefaultImage = (productId) => {
        const defaultImages = {
            1: 'https://www.factsaboutbpa.org/wp-content/uploads/2017/09/waterbottles.png',
            2: 'https://www.waterwise.com/wp-content/uploads/2017/08/3_gallon_1203.jpg',
            3: 'https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/10/09/453824306.png',
        };
        return defaultImages[productId] || 'https://example.com/images/default-water-bottle.jpg';
    };

    return (
        <div className="dashboard">
            <header className="header">
                <div className="header-content">
                    <h1 className="title">Bottled Water Delivery</h1>
                    <div className="user-info">
                        {isLoggedIn ? (
                            <div className="logged-in-controls">
                                <span className="user-text">
                                    Welcome, {user?.email} 
                                    <span className="user-role">({user?.role})</span>
                                </span>
                                {userService.isCustomer() && (
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="profile-button"
                                    >
                                        Profile
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        userService.logout();
                                        navigate('/dashboard');
                                    }}
                                    className="logout-button"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/registration-or-login')}
                                className="login-button"
                            >
                                Login / Register
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="main">
                {userService.isAdmin() ? (
                    <div className="admin-panel">
                        <h2 className="section-title">Admin Dashboard</h2>
                        <div className="admin-content">
                            <div className="user-table">
                                <h3 className="table-title">User Management</h3>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Created At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.user_id} className={!user.is_active ? 'inactive-row' : ''}>
                                                    <td>{user.user_id}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`badge ${user.role}-badge`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${user.is_active ? 'active-badge' : 'inactive-badge'}`}>
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button 
                                                                className={`action-button ${user.is_active ? 'deactivate-button' : 'activate-button'}`}
                                                                onClick={() => handleToggleUserStatus(user)}
                                                            >
                                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="profiles-section">
                                <h3 className="section-title">Customer Profiles</h3>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Address</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerProfiles.map((profile) => (
                                                <tr key={profile.customer_id} className={!profile.is_active ? 'inactive-row' : ''}>
                                                    <td>{profile.full_name}</td>
                                                    <td>{profile.email}</td>
                                                    <td>{profile.phone}</td>
                                                    <td>
                                                        {profile.address && typeof profile.address === 'object' ? 
                                                            `${profile.address.jalan}, ${profile.address.kelurahan}, ${profile.address.kota}` : 
                                                            profile.address}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${profile.is_active ? 'active-badge' : 'inactive-badge'}`}>
                                                            {profile.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="section-title">Organization Profiles</h3>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Organization Name</th>
                                                <th>Email</th>
                                                <th>Contact Person</th>
                                                <th>Phone</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orgProfiles.map((profile) => (
                                                <tr key={profile.org_id} className={!profile.is_active ? 'inactive-row' : ''}>
                                                    <td>{profile.org_name}</td>
                                                    <td>{profile.email}</td>
                                                    <td>{profile.contact_person}</td>
                                                    <td>{profile.contact_phone_org}</td>
                                                    <td>{profile.org_type}</td>
                                                    <td>
                                                        <span className={`badge ${profile.is_active ? 'active-badge' : 'inactive-badge'}`}>
                                                            {profile.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="products-container">
                            <h2 className="section-title">Our Products</h2>
                            <div className="products-grid">
                                {products.map((product) => (
                                    <div key={product.product_id} className="product-card">
                                        <div className="product-image-container">
                                            <img 
                                                src={product.image_url || getDefaultImage(product.product_id)}
                                                alt={product.name}
                                                className="product-image"
                                            />
                                        </div>
                                        <div className="product-details">
                                            <h3 className="product-name">{product.container_type}</h3>
                                            <p className="product-description">{product.description}</p>
                                            <p className="product-price">
                                                Rp {product.unit_price}
                                                {isLoggedIn && userService.isOrganization() && (
                                                    <span className="bulk-price"> / Bulk price available</span>
                                                )}
                                            </p>
                                            {isLoggedIn && (userService.isCustomer() || userService.isOrganization()) && (
                                                <button 
                                                    className="order-button"
                                                    onClick={() => handleOrder(product)}
                                                >
                                                    {userService.isOrganization() ? 'Bulk Order' : 'Add to Cart'}
                                                </button>
                                            )}
                                            {!isLoggedIn && (
                                                <button 
                                                    className="login-prompt-button"
                                                    onClick={() => navigate('/registration-or-login')}
                                                >
                                                    Login to Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isLoggedIn && (
                            <div className="user-dashboard">
                                {userService.isOrganization() && (
                                    <div className="org-panel">
                                        <h2 className="section-title">Organization Dashboard</h2>
                                        <div className="org-controls">
                                            <button onClick={() => navigate('/org-profile')} className="dashboard-button">Organization Profile</button>
                                            <button className="dashboard-button">View Bulk Orders</button>
                                            <button className="dashboard-button">Order History</button>
                                            <button className="dashboard-button">Organization Settings</button>
                                        </div>
                                    </div>
                                )}

                                {userService.isCustomer() && (
                                    <div className="customer-panel">
                                        <h2 className="section-title">Customer Dashboard</h2>
                                        <div className="customer-controls">
                                            <button className="dashboard-button">My Orders</button>
                                            <button className="dashboard-button">Shopping Cart</button>
                                            <button className="dashboard-button">Delivery Status</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
            
            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; {new Date().getFullYear()} Bottled Water Delivery. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="/about">About Us</a>
                        <a href="/contact">Contact</a>
                        <a href="/terms">Terms of Service</a>
                        <a href="/privacy">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;