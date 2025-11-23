import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PULogo from '../../assets/pu-logo.png';
import toast from 'react-hot-toast';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [stage, setStage] = useState('email'); // Stages: 'email', 'otp', 'success'
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Sending OTP...');
        try {
            await axios.post('http://localhost:5000/api/auth/admin/forgot-password', { email });
            toast.dismiss(loadingToast);
            toast.success('OTP sent to your email!');
            setStage('otp');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.msg || "Failed to send OTP. Is the email correct?");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            return toast.error("New password must be at least 8 characters long.");
        }
        const loadingToast = toast.loading('Resetting password...');
        try {
            await axios.post('http://localhost:5000/api/auth/admin/reset-password', { email, otp, newPassword });
            toast.dismiss(loadingToast);
            toast.success('Password has been reset successfully!');
            setStage('success');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.msg || "Failed to reset password.");
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-200 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8 space-y-6">
                <div className="text-center">
                    <img className="mx-auto h-16 w-auto mb-4" src={PULogo} alt="Parul University" />
                    <h2 className="text-2xl text-gray-800 font-bold">Admin Password Reset</h2>
                </div>
                
                {stage === 'email' && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <p className="text-sm text-center text-gray-500">Enter your registered admin email to receive a One-Time Password (OTP).</p>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input id="email" type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full form-input" required />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link to="/admin/login" className="w-full text-center py-2.5 px-4 border rounded-md text-sm font-medium hover:bg-gray-100">Back to Login</Link>
                            <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90">Send OTP</button>
                        </div>
                    </form>
                )}

                {stage === 'otp' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-sm text-center text-gray-500">Enter the OTP sent to <strong>{email}</strong> and your new password.</p>
                        <div>
                           <label htmlFor="otp" className="sr-only">OTP</label>
                           <input id="otp" type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full form-input" required />
                        </div>
                        <div>
                           <label htmlFor="newPassword" className="sr-only">New Password</label>
                           <input id="newPassword" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full form-input" required />
                        </div>
                         <div className="flex items-center space-x-2">
                            <button type="button" onClick={() => setStage('email')} className="w-full text-center py-2.5 px-4 border rounded-md text-sm font-medium hover:bg-gray-100">Back</button>
                            <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90">Reset Password</button>
                        </div>
                    </form>
                )}

                 {stage === 'success' && (
                    <div className="text-center">
                        <p className="text-success font-semibold text-lg">Password Reset Successfully!</p>
                        <Link to="/admin/login" className="inline-block mt-4 w-full text-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90">
                            Proceed to Admin Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;