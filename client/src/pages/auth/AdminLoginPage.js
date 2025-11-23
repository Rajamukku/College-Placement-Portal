import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import PULogo from '../../assets/pu-logo.png';

const AdminLoginPage = () => {
    // The state names must match the keys we send in the API call
    const [loginIdentifier, setLoginIdentifier] = useState('admin@paruluniversity.ac.in');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Authenticating Admin...');
        
        try {
            // This is the data object we are sending. 
            // The keys here (`loginIdentifier`, `password`) MUST match what the backend expects.
            const loginData = { 
                loginIdentifier: loginIdentifier, 
                password: password 
            };
            
            // The API call to the generic login endpoint
            const res = await axios.post('http://localhost:5000/api/auth/login', loginData);

            toast.dismiss(loadingToast);
            
            const { token } = res.data;
            const userRole = JSON.parse(atob(token.split('.')[1])).user.role;

            // This is a crucial client-side check. Even if login is successful,
            // we ensure only an 'admin' can proceed from this page.
            if (userRole !== 'admin') {
                toast.error('Access Denied: This account does not have admin privileges.');
                // Do not save token or navigate
                return; 
            }

            // If the role is 'admin', then we proceed
            localStorage.setItem('token', token);
            toast.success('Admin login successful!');
            navigate('/admin/dashboard');

        } catch (err) {
            toast.dismiss(loadingToast);
            // This will display the specific error from the backend (e.g., "Invalid Credentials")
            // or a generic one if the server can't be reached.
            const errorMsg = err.response?.data?.msg || 'Login failed. Please check your credentials or server connection.';
            toast.error(errorMsg);
            console.error("Admin Login Error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <img className="mx-auto h-16 w-auto" src={PULogo} alt="Parul University" />
                    <h2 className="mt-6 text-3xl font-bold text-pu-blue">Admin Portal</h2>
                    <p className="mt-2 text-sm text-gray-500">Secure Access Only</p>
                </div>
                <form className="space-y-6" onSubmit={handleAdminLogin}>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Admin Email</label>
                        <input
                            type="text"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-opacity-90 transition">
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;