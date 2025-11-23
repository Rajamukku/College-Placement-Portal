import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PUGate from '../../assets/pu-gate.jpg';
import PUCrestLogo from '../../assets/pu-crest-logo.png';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const GoogleIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.405,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
);

const LoginPage = () => {
    const [role, setRole] = useState('student');
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Clear any stale tokens on mount to avoid cross-role leakage
    useEffect(() => {
        localStorage.removeItem('token');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!loginIdentifier || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Authenticating...');
        
        try {
            const loginData = { loginIdentifier, password, role };

            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            if (!data.token) {
                throw new Error('No authentication token received');
            }

            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            
            // Decode token to get user role
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            const userRole = payload.user?.role;

            toast.dismiss(loadingToast);
            toast.success('Login successful!');

            // Redirect based on role
            if (userRole === 'student') {
                navigate('/student/dashboard');
            } else if (userRole === 'company') {
                navigate('/company/dashboard');
            } else if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else {
                console.error('Unknown user role:', userRole);
                navigate('/');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const placeholderText = role === 'student' ? 'Enter Student ID or Email' : 'Enter Company Email';

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg shadow-lg rounded-lg overflow-hidden">
                <img src={PUGate} alt="Parul University Gate" className="w-full h-auto" />
                
                <div className="bg-surface p-8">
                    <img src={PUCrestLogo} alt="Parul University Logo" className="mx-auto h-28 w-auto mb-6" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="flex justify-center items-center space-x-6 text-text-primary">
                            <label className="flex items-center cursor-pointer text-lg">
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="company" 
                                    checked={role === 'company'} 
                                    onChange={() => { setRole('company'); localStorage.removeItem('token'); }} 
                                    className="form-radio h-5 w-5 text-secondary focus:ring-secondary" 
                                />
                                <span className="ml-2">Company</span>
                            </label>
                            <label className="flex items-center cursor-pointer text-lg">
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="student" 
                                    checked={role === 'student'} 
                                    onChange={() => { setRole('student'); localStorage.removeItem('token'); }} 
                                    className="form-radio h-5 w-5 text-secondary focus:ring-secondary" 
                                />
                                <span className="ml-2">Student</span>
                            </label>
                        </div>
                        
                        <div>
                            <label htmlFor="loginIdentifier" className="block text-sm font-medium text-text-secondary">
                                {role === 'student' ? 'Student ID or Email' : 'Company Email'}
                            </label>
                            <input
                                id="loginIdentifier" 
                                type="text" 
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                placeholder={placeholderText}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                                required
                                autoComplete="username"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password" 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                                    required
                                    autoComplete="current-password"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`w-full sm:w-auto px-8 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}`}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                            
                            <Link 
                                to="/forgot-password" 
                                className="text-sm text-primary hover:text-secondary hover:underline font-medium"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </form>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-surface text-text-secondary">Or</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4">
                        <button 
                            className="w-full max-w-xs flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-base font-medium text-text-primary hover:bg-gray-50 transition-all"
                            onClick={async () => {
                                try {
                                    // Load Google Identity Services script
                                    await new Promise((resolve, reject) => {
                                        if (window.google && window.google.accounts) return resolve();
                                        const script = document.createElement('script');
                                        script.src = 'https://accounts.google.com/gsi/client';
                                        script.async = true;
                                        script.defer = true;
                                        script.onload = resolve;
                                        script.onerror = reject;
                                        document.body.appendChild(script);
                                    });

                                    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
                                    if (!clientId) {
                                        return toast.error('Google Client ID not configured');
                                    }

                                    // Prompt one-tap to get credential
                                    await new Promise((resolve) => {
                                        window.google.accounts.id.initialize({
                                            client_id: clientId,
                                            callback: async (response) => {
                                                try {
                                                    const loadingToast = toast.loading('Signing in with Google...');
                                                    const res = await fetch('http://localhost:5000/api/auth/google', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ credential: response.credential, role })
                                                    });
                                                    const data = await res.json();
                                                    toast.dismiss(loadingToast);
                                                    if (!res.ok) {
                                                        return toast.error(data.msg || 'Google login failed');
                                                    }
                                                    localStorage.setItem('token', data.token);
                                                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                                                    const userRole = payload.user?.role;
                                                    toast.success('Login successful!');
                                                    if (userRole === 'student') navigate('/student/dashboard');
                                                    else if (userRole === 'company') navigate('/company/dashboard');
                                                    else if (userRole === 'admin') navigate('/admin/dashboard');
                                                    else navigate('/');
                                                } catch (e) {
                                                    console.error(e);
                                                    toast.error('Google login failed');
                                                }
                                            }
                                        });
                                        window.google.accounts.id.prompt((notification) => {
                                            // If one-tap not displayed, show fallback popup
                                            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                                                window.google.accounts.id.renderButton(document.createElement('div'), { theme: 'outline', size: 'large' });
                                            }
                                            resolve();
                                        });
                                    });
                                } catch (err) {
                                    console.error('Google script error', err);
                                    toast.error('Unable to load Google Sign-In');
                                }
                            }}
                        >
                            <GoogleIcon />
                            <span className="ml-3">Sign in with Google</span>
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default LoginPage;