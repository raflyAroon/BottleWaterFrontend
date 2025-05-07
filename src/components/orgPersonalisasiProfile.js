import React, { useState, useEffect } from 'react';
import { organizationProfileService, userService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import '../style/orgPersonalisasiProfile.css';

const OrgPersonalisasiProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        org_name: '',
        contact_person: '',
        contact_phone_org: '',
        org_type: '' // Default empty, user must choose
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const orgTypes = [
        { value: 'retail', label: 'Retail' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'education', label: 'Education' },
        { value: 'government', label: 'Government' },
        { value: 'non_profit', label: 'Non-Profit Organization' }
    ];

    useEffect(() => {
        const checkAuthAndLoadProfile = async () => {
            try {
                const currentUser = userService.getCurrentUser();
                if (!currentUser || !userService.isOrganization()) {
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
            console.log('Memuat profil...');
            const profileData = await organizationProfileService.getOrgProfileById();
            console.log('Data profil yang diterima:', profileData);
            if (profileData && profileData.data) {
                const data = profileData.data;
                console.log('Setting profile dengan data:', data);
                setProfile({
                    org_name: data.org_name || '',
                    contact_person: data.contact_person || '',
                    contact_phone_org: data.contact_phone_org ? 
                        data.contact_phone_org.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3') : '',
                    org_type: data.org_type || ''
                });
            } else {
                console.log('Tidak ada data profil yang diterima');
            }
        } catch (error) {
            console.error('Error saat memuat profil:', error);
            setError(error.message || 'Error loading profile');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePhoneNumber = (e) => {
        const value = e.target.value.replace(/[^\d+ -]/g, '');
        setProfile(prev => ({
            ...prev,
            contact_phone_org: value
        }));
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

            // Format nomor telepon sebelum mengirim ke server (hapus format)
            const submissionData = {
                ...profile,
                contact_phone_org: profile.contact_phone_org.replace(/[-\s]/g, '')
            };

            const response = await organizationProfileService.createOrUpdateProfile(submissionData);
            
            if (response.status === 'success') {
                setSuccessMessage('Profil berhasil diperbarui!');
                await loadProfile();
            } else {
                throw new Error(response.message || 'Terjadi kesalahan saat memperbarui profil');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError(error.message || 'Gagal memperbarui profil');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <div>Memuat data profil...</div>
            </div>
        );
    }

    return (
        <div className="org-profile-container">
            <h1 className="profile-title">
                Profil Organisasi
                <span className="title-decoration"></span>
            </h1>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span> {error}
                </div>
            )}
            
            {successMessage && (
                <div className="success-message">
                    <span className="success-icon">✅</span> {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">

                <div className="form-group">
                    <label className="form-label" htmlFor="org_name"></label>
                    <input
                        id="org_name"
                        type="text"
                        name="org_name"
                        value={profile.org_name}
                        onChange={handleChange}
                        className="form-input"
                        placeHolder="Nama Organisasi"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="contact_person"></label>
                    <input
                        id="contact_person"
                        type="text"
                        name="contact_person"
                        value={profile.contact_person}
                        onChange={handleChange}
                        className="form-input"
                        placeHolder="Nama Kontak Person"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="contact_phone_org"></label>
                    <input
                        id="contact_phone_org"
                        type="tel"
                        name="contact_phone_org"
                        value={profile.contact_phone_org}
                        onChange={validatePhoneNumber}
                        className="form-input"
                        placeHolder="Nomor Telepon Organisasi"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="org_type">Tipe Organisasi</label>
                    <select
                        id="org_type"
                        name="org_type"
                        value={profile.org_type}
                        onChange={handleChange}
                        className="form-input"
                        required
                    >
                        <option value="">Pilih Tipe Organisasi</option>
                        {orgTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="button-container">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="back-button"
                        disabled={loading}
                    >
                        Kembali ke Dashboard
                    </button>
                    <button 
                        type="submit" 
                        className="save-button"
                        disabled={loading}
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Profil'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrgPersonalisasiProfile;