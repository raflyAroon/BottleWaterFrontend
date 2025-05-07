import React, { useState, useEffect } from 'react';
import { customerProfileService, userService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import '../style/personalisasiProfile.css';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        address: {
            negara: '',
            provinsi: '',
            kota: '',
            kabupaten: '',
            kelurahan: '',
            jalan: '',
            kode_pos: ''
        },
        delivery_instructions: JSON.stringify({
            preferred_time: '09:00',
            day_preference: 'weekday'
        })
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const checkAuthAndLoadProfile = async () => {
            try {
                // Get current user info from JWT token
                const currentUser = userService.getCurrentUser();
                if (!currentUser || !userService.isCustomer()) {
                    navigate('/login');
                    return;
                }

                await loadProfile();
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError(error.message || 'Error loading profile');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndLoadProfile();
    }, [navigate]);

    const loadProfile = async () => {
        try {
            const response = await customerProfileService.getCustomerProfileById();
            if (response.data) {
                const loadedProfile = response.data;
                try {
                    const parsedInstructions = JSON.parse(loadedProfile.delivery_instructions);
                    const address = typeof loadedProfile.address === 'string' 
                        ? JSON.parse(loadedProfile.address)
                        : loadedProfile.address || {
                            negara: '',
                            provinsi: '',
                            kota: '',
                            kabupaten: '',
                            kelurahan: '',
                            jalan: '',
                            kode_pos: ''
                        };
                    
                    setProfile({
                        ...loadedProfile,
                        address,
                        delivery_instructions: JSON.stringify(parsedInstructions)
                    });
                } catch (e) {
                    setProfile({
                        ...loadedProfile,
                        address: {
                            negara: '',
                            provinsi: '',
                            kota: '',
                            kabupaten: '',
                            kelurahan: '',
                            jalan: '',
                            kode_pos: ''
                        },
                        delivery_instructions: JSON.stringify({
                            preferred_time: '09:00',
                            day_preference: 'weekday'
                        })
                    });
                }
            }
        } catch (error) {
            setError(error.message || 'Error loading profile');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'preferred_time' || name === 'day_preference') {
            const currentInstructions = JSON.parse(profile.delivery_instructions);
            setProfile(prev => ({
                ...prev,
                delivery_instructions: JSON.stringify({
                    ...currentInstructions,
                    [name]: value
                })
            }));
        } else if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setProfile(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        try {
            const isLoggedIn = await userService.isLoggedIn();
            if (!isLoggedIn) {
                throw new Error('Silakan login terlebih dahulu');
            }

            // Langsung menggunakan createOrUpdateProfile
            const response = await customerProfileService.createOrUpdateProfile(profile);
            
            if (response.status === 'success') {
                setSuccessMessage('Profile berhasil diperbarui!');
                await loadProfile(); // Reload profile untuk mendapatkan data terbaru
            } else {
                setError(response.message || 'Terjadi kesalahan saat memperbarui profil');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError(error.message || 'Error updating profile');
            }
        }
    };

    const deliveryTimes = [
        '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
    ];
    
    const deliveryInstructions = JSON.parse(profile.delivery_instructions);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <div>Loading profile data...</div>
            </div>
        );
    }

    return (
        <body className= "personalisasi-profile">
        <div className="profile-container">
            <h1 className="profile-title">
                Personalisasi Profil
                <span className="title-decoration"></span>
            </h1>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label className="form-label"></label>
                    <input
                        type="text"
                        name="full_name"
                        value={profile.full_name}
                        onChange={handleChange}
                        className="form-input"
                        placeHolder="Nama Lengkap"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label"></label>
                    <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Nomor Telepon"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Alamat</label>
                    <div className="address-fields">
                        <input
                            type="text"
                            name="address.negara"
                            value={profile.address.negara}
                            onChange={handleChange}
                            placeholder="Negara"
                            className="form-input"
                            placeHolder="Negara"
                            required
                        />
                        <input
                            type="text"
                            name="address.provinsi"
                            value={profile.address.provinsi}
                            onChange={handleChange}
                            placeholder="Provinsi"
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            name="address.kota"
                            value={profile.address.kota}
                            onChange={handleChange}
                            placeholder="Kota"
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            name="address.kabupaten"
                            value={profile.address.kabupaten}
                            onChange={handleChange}
                            placeholder="Kabupaten"
                            className="form-input"
                        />
                        <input
                            type="text"
                            name="address.kelurahan"
                            value={profile.address.kelurahan}
                            onChange={handleChange}
                            placeholder="Kelurahan"
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            name="address.jalan"
                            value={profile.address.jalan}
                            onChange={handleChange}
                            placeholder="Nama Jalan"
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            name="address.kode_pos"
                            value={profile.address.kode_pos}
                            onChange={handleChange}
                            placeholder="Kode Pos"
                            className="form-input"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Waktu Pengiriman yang Diinginkan</label>
                    <select
                        name="preferred_time"
                        value={deliveryInstructions.preferred_time}
                        onChange={handleChange}
                        className="time-select"
                    >
                        {deliveryTimes.map(time => (
                            <option key={time} value={time}>
                                {time} WIB
                            </option>
                        ))}
                    </select>

                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="day_preference"
                                value="weekday"
                                checked={deliveryInstructions.day_preference === 'weekday'}
                                onChange={handleChange}
                                className="radio-input"
                            />
                            <span className="radio-custom"></span>
                            Hari Kerja (Senin-Jumat)
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="day_preference"
                                value="weekend"
                                checked={deliveryInstructions.day_preference === 'weekend'}
                                onChange={handleChange}
                                className="radio-input"
                            />
                            <span className="radio-custom"></span>
                            Akhir Pekan (Sabtu-Minggu)
                        </label>
                    </div>
                </div>

                <div className="button-container">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="back-button"
                    >
                        Kembali ke Dashboard
                    </button>
                    <button 
                        type="submit" 
                        className="save-button"
                    >
                        Simpan Profil
                    </button>
                </div>
            </form>
        </div>
        </body>
    );
};

export default CustomerProfile;
