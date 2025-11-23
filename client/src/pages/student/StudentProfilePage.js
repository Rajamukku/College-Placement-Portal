import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import { 
    UserCircleIcon, 
    AcademicCapIcon, 
    PhoneIcon, 
    EnvelopeIcon, 
    DocumentTextIcon,
    ArrowTopRightOnSquareIcon,
    SparklesIcon,
    IdentificationIcon,
    BookOpenIcon,
    BriefcaseIcon,
    CodeBracketIcon,
    PencilIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const StudentProfilePage = () => {
    const [studentData, setStudentData] = useState({
        name: '',
        studentId: '',
        email: '',
        phone: '',
        branch: '',
        resumeLink: '',
        academics: { tenth: '', twelfth: '', cpi: '' },
        skills: [],
        isProfileComplete: false,
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        linkedin: '',
        github: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [semSgpa, setSemSgpa] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/students/me', {
                    headers: { 'x-auth-token': token }
                });
                if (response.data.success) {
                    const student = response.data.student;
                    // Convert relative resume link to full URL if needed
                    let resumeLink = student.resumeLink;
                    if (resumeLink && resumeLink.startsWith('/uploads/')) {
                        resumeLink = `http://localhost:5000${resumeLink}`;
                    }
                    
                    setStudentData(prev => ({
                        ...prev,
                        ...student,
                        resumeLink: resumeLink || prev.resumeLink,
                        // Ensure nested objects are properly initialized
                        academics: student.academics || { tenth: '', twelfth: '', cpi: '' },
                        skills: student.skills || []
                    }));
                    // Prefill semSgpa from marksheets if present
                    const ms = response.data.student.marksheets;
                    if (ms && Array.isArray(ms.semesters)) {
                        const init = {};
                        ms.semesters.forEach(s => { init[s.sem] = s.sgpa; });
                        setSemSgpa(init);
                    }
                }
            } catch (error) {
                console.error('Error fetching student profile:', error);
                toast.error('Failed to load student profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentProfile();
    }, []);

    const validatePhone = (phone) => {
        if (!phone || phone === '') return true; // Allow empty
        const cleaned = phone.toString().replace(/[\s\-()]/g, '');
        const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
        return phoneRegex.test(cleaned);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        
        // Clear error for nested fields (e.g., academics.tenth)
        if (name.includes('.')) {
            const errorKey = name;
            if (errors[errorKey]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[errorKey];
                    return newErrors;
                });
            }
        }
        
        // Validate phone number in real-time
        if (name === 'phone' && value && !validatePhone(value)) {
            setErrors(prev => ({
                ...prev,
                phone: 'Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)'
            }));
        }
        
        // Handle nested objects like academics
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setStudentData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setStudentData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const computedCgpa = (() => {
        const values = Object.values(semSgpa).map(v => Number(v)).filter(v => !Number.isNaN(v));
        if (values.length === 0) return '';
        const sum = values.reduce((a,b)=>a+b,0);
        return (sum / values.length).toFixed(2);
    })();

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        
        // Frontend validation
        const newErrors = {};
        
        // Validate phone number
        if (studentData.phone && !validatePhone(studentData.phone)) {
            newErrors.phone = 'Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)';
        }
        
        // Validate pincode if provided
        if (studentData.pincode && studentData.pincode !== '') {
            const pincodeRegex = /^\d{6}$/;
            if (!pincodeRegex.test(studentData.pincode.toString().trim())) {
                newErrors.pincode = 'Pincode must be a 6-digit number';
            }
        }
        
        // Validate academics
        if (studentData.academics?.tenth && (isNaN(parseFloat(studentData.academics.tenth)) || parseFloat(studentData.academics.tenth) < 0 || parseFloat(studentData.academics.tenth) > 100)) {
            newErrors['academics.tenth'] = '10th percentage must be between 0 and 100';
        }
        if (studentData.academics?.twelfth && (isNaN(parseFloat(studentData.academics.twelfth)) || parseFloat(studentData.academics.twelfth) < 0 || parseFloat(studentData.academics.twelfth) > 100)) {
            newErrors['academics.twelfth'] = '12th percentage must be between 0 and 100';
        }
        if (studentData.academics?.cpi && (isNaN(parseFloat(studentData.academics.cpi)) || parseFloat(studentData.academics.cpi) < 0 || parseFloat(studentData.academics.cpi) > 10)) {
            newErrors['academics.cpi'] = 'CPI must be between 0 and 10';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the validation errors before saving');
            return;
        }
        
        setErrors({});
        
        try {
            const token = localStorage.getItem('token');
            // Prepare payload: include fields that have values
            const payload = {};
            
            // Include profile fields only if they have values
            if (studentData.phone !== undefined && studentData.phone !== '') payload.phone = studentData.phone;
            if (studentData.branch !== undefined && studentData.branch !== '') payload.branch = studentData.branch;
            if (studentData.resumeLink !== undefined && studentData.resumeLink !== '') payload.resumeLink = studentData.resumeLink;
            if (studentData.dateOfBirth !== undefined && studentData.dateOfBirth !== '') payload.dateOfBirth = studentData.dateOfBirth;
            if (studentData.gender !== undefined && studentData.gender !== '') payload.gender = studentData.gender;
            if (studentData.address !== undefined && studentData.address !== '') payload.address = studentData.address;
            if (studentData.city !== undefined && studentData.city !== '') payload.city = studentData.city;
            if (studentData.state !== undefined && studentData.state !== '') payload.state = studentData.state;
            if (studentData.pincode !== undefined && studentData.pincode !== '') payload.pincode = studentData.pincode;
            if (studentData.linkedin !== undefined && studentData.linkedin !== '') payload.linkedin = studentData.linkedin;
            if (studentData.github !== undefined && studentData.github !== '') payload.github = studentData.github;
            
            // Process academics - send object if any field has a value
            if (studentData.academics) {
                const academicsObj = {};
                let hasAcademics = false;
                
                if (studentData.academics.tenth !== undefined && studentData.academics.tenth !== '') {
                    const tenthVal = parseFloat(studentData.academics.tenth);
                    if (!isNaN(tenthVal)) {
                        academicsObj.tenth = tenthVal;
                        hasAcademics = true;
                    }
                }
                if (studentData.academics.twelfth !== undefined && studentData.academics.twelfth !== '') {
                    const twelfthVal = parseFloat(studentData.academics.twelfth);
                    if (!isNaN(twelfthVal)) {
                        academicsObj.twelfth = twelfthVal;
                        hasAcademics = true;
                    }
                }
                if (studentData.academics.cpi !== undefined && studentData.academics.cpi !== '') {
                    const cpiVal = parseFloat(studentData.academics.cpi);
                    if (!isNaN(cpiVal)) {
                        academicsObj.cpi = cpiVal;
                        hasAcademics = true;
                    }
                }
                
                if (hasAcademics) {
                    payload.academics = academicsObj;
                }
            }
            
            // Process skills - always send if it's an array
            if (Array.isArray(studentData.skills)) {
                payload.skills = studentData.skills;
            }
            
            console.log('Sending payload:', JSON.stringify(payload, null, 2));
            
            const response = await axios.put('http://localhost:5000/api/students/profile', payload, {
                headers: { 'x-auth-token': token }
            });
            
            // Update local state with the response data if available
            if (response.data && response.data.student) {
                const student = response.data.student;
                setStudentData(prev => ({
                    ...prev,
                    ...student,
                    academics: student.academics || prev.academics || { tenth: '', twelfth: '', cpi: '' },
                    skills: student.skills || prev.skills || []
                }));
            }
            
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            setErrors({});
        } catch (error) {
            console.error('Error updating student profile:', error);
            
            // Better error handling - check multiple possible error formats
            let errorMessage = 'Failed to update profile';
            const fieldErrors = {};
            
            if (error.response?.data) {
                const data = error.response.data;
                
                // Try different error message formats
                if (data.message) {
                    errorMessage = data.message;
                } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    // Map errors to fields
                    data.errors.forEach(err => {
                        if (err.param) {
                            fieldErrors[err.param] = err.msg || err.message;
                        }
                    });
                    // Get first error message
                    const firstError = data.errors[0];
                    errorMessage = firstError.msg || firstError.message || firstError;
                } else if (data.msg) {
                    errorMessage = data.msg;
                } else if (data.error) {
                    errorMessage = data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setErrors(fieldErrors);
            toast.error(errorMessage);
        }
    };

    const handleViewResume = () => {
        if (studentData.resumeLink) {
            // Validate URL format
            try {
                const url = new URL(studentData.resumeLink);
                window.open(url.href, '_blank', 'noopener,noreferrer');
                toast.success('Opening resume in new tab...');
            } catch (e) {
                // If URL is invalid, try opening anyway (might be a relative path or drive link)
                window.open(studentData.resumeLink, '_blank', 'noopener,noreferrer');
                toast.success('Opening resume...');
            }
        } else {
            toast.error("No resume link has been set yet. Please add a resume link or generate one using AI Resume Builder.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header userType="student" />
                <main className="max-w-7xl mx-auto py-10 px-4">
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-text-secondary">Loading your profile...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header userType="student" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
                        <p className="text-text-secondary">Manage your personal and academic information</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 flex items-center gap-2"
                        >
                            <PencilIcon className="h-5 w-5" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 pb-2 border-b">
                        <UserCircleIcon className="h-6 w-6 inline-block mr-2 text-primary" />
                        Personal Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={studentData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                disabled={!isEditing}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IdentificationIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={studentData.studentId}
                                    className="w-full pl-10 p-2 border rounded-md bg-gray-50 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={studentData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 p-2 border rounded-md"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={studentData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 p-2 border rounded-md ${errors.phone ? 'border-red-500' : ''}`}
                                    disabled={!isEditing}
                                    placeholder="e.g., 9876543210 or +919876543210"
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                            <input
                                type="text"
                                name="branch"
                                value={studentData.branch}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={studentData.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : ''}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                                disabled={!isEditing}
                            />
                            {errors.dateOfBirth && (
                                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={studentData.gender}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${errors.gender ? 'border-red-500' : ''}`}
                                disabled={!isEditing}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                name="address"
                                value={studentData.address}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                rows="2"
                                disabled={!isEditing}
                                placeholder="Enter your address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                value={studentData.city}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                disabled={!isEditing}
                                placeholder="Enter your city"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                value={studentData.state}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-md"
                                disabled={!isEditing}
                                placeholder="Enter your state"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={studentData.pincode}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${errors.pincode ? 'border-red-500' : ''}`}
                                disabled={!isEditing}
                                placeholder="6-digit pincode"
                                maxLength="6"
                            />
                            {errors.pincode && (
                                <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                            <input
                                type="url"
                                name="linkedin"
                                value={studentData.linkedin}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${errors.linkedin ? 'border-red-500' : ''}`}
                                disabled={!isEditing}
                                placeholder="https://linkedin.com/in/yourprofile"
                            />
                            {errors.linkedin && (
                                <p className="mt-1 text-sm text-red-600">{errors.linkedin}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
                            <input
                                type="url"
                                name="github"
                                value={studentData.github}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${errors.github ? 'border-red-500' : ''}`}
                                disabled={!isEditing}
                                placeholder="https://github.com/yourusername"
                            />
                            {errors.github && (
                                <p className="mt-1 text-sm text-red-600">{errors.github}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                            
                            {/* Resume View Card */}
                            {studentData.resumeLink ? (
                                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500 p-3 rounded-full">
                                                <DocumentTextIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-text-primary">{studentData.name || 'Student'}'s Resume</p>
                                                <p className="text-xs text-text-secondary truncate max-w-xs">{studentData.resumeLink}</p>
                                            </div>
                                        </div>
                                        <a
                                            type="button"
                                            href={studentData.resumeLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            download={(studentData.name ? studentData.name.replace(/\s+/g,'-') : 'resume') + '-Resume.pdf'}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                                        >
                                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                                            View Resume
                                        </a>
                                    </div>
                                    {/* Inline preview for PDF links */}
                                    {(/\.pdf($|\?)/i.test(studentData.resumeLink) || studentData.resumeLink.includes('/uploads/')) && (
                                        <div className="mt-4 border rounded overflow-hidden h-96">
                                            <iframe 
                                                title="Resume Preview" 
                                                src={studentData.resumeLink.startsWith('http') ? studentData.resumeLink : `http://localhost:5000${studentData.resumeLink}`} 
                                                className="w-full h-full" 
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <ExclamationTriangleIcon className="h-5 w-5" />
                                        <p className="text-sm font-medium">No resume uploaded yet</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Resume PDF Upload (preferred) */}
                            <div className="mb-4">
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const fd = new FormData(form);
                                    try {
                                        const token = localStorage.getItem('token');
                                        console.log('Token retrieved:', token ? 'Token exists' : 'Token is null/undefined');
                                        
                                        if (!token || token.trim() === '') {
                                            toast.error('Please login to continue');
                                            console.error('No token found in localStorage');
                                            return;
                                        }
                                        
                                        // Ensure token is properly included in headers
                                        const headers = {
                                            'x-auth-token': token.trim()
                                        };
                                        
                                        console.log('Uploading resume with headers:', { 'x-auth-token': token ? 'Token present' : 'Token missing' });
                                        
                                        const { data } = await axios.post('http://localhost:5000/api/students/resume', fd, { 
                                            headers: headers
                                            // Content-Type will be set automatically by axios for FormData
                                        });
                                        
                                        if (data && data.resumeLink) {
                                            toast.success('Resume uploaded successfully');
                                            // Convert relative resume link to full URL if needed
                                            let resumeLink = data.resumeLink;
                                            if (resumeLink && resumeLink.startsWith('/uploads/')) {
                                                resumeLink = `http://localhost:5000${resumeLink}`;
                                            }
                                            setStudentData(prev => ({ ...prev, resumeLink: resumeLink }));
                                            form.reset();
                                        } else {
                                            throw new Error('Failed to upload resume');
                                        }
                                    } catch (err) {
                                        console.error('Resume upload error:', err);
                                        const errorMsg = err.response?.data?.msg || err.message || 'Resume upload failed';
                                        toast.error(errorMsg);
                                        
                                        // If token error, redirect to login
                                        if (err.response?.status === 401) {
                                            setTimeout(() => {
                                                localStorage.removeItem('token');
                                                window.location.href = '/login';
                                            }, 2000);
                                        }
                                    }
                                }} className="flex items-center gap-3">
                                    <input name="pdf" type="file" accept="application/pdf" className="w-full p-2 border rounded-md" required />
                                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Upload PDF</button>
                                </form>
                                <p className="text-xs text-gray-500 mt-1">Upload a PDF resume. This replaces any existing link.</p>
                            </div>
                            
                            {/* AI Resume Builder Button */}
                            <div className="mt-4">
                                <Link 
                                    to="/student/ai-resume" 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white text-sm font-medium rounded-md hover:from-purple-700 hover:to-pink-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <SparklesIcon className="h-5 w-5" />
                                    Generate AI Resume
                                </Link>
                                <p className="text-xs text-gray-500 mt-2">Create a professional, ATS-friendly resume tailored to job descriptions using AI</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Information Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 pb-2 border-b">
                        <AcademicCapIcon className="h-6 w-6 inline-block mr-2 text-primary" />
                        Academic Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">10th Percentage</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <BookOpenIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="academics.tenth"
                                    value={studentData.academics?.tenth || ''}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 p-2 border rounded-md ${errors['academics.tenth'] ? 'border-red-500' : ''}`}
                                    disabled={!isEditing}
                                    min="0"
                                    max="100"
                                />
                            </div>
                            {errors['academics.tenth'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['academics.tenth']}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">12th Percentage</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <BookOpenIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="academics.twelfth"
                                    value={studentData.academics?.twelfth || ''}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 p-2 border rounded-md ${errors['academics.twelfth'] ? 'border-red-500' : ''}`}
                                    disabled={!isEditing}
                                    min="0"
                                    max="100"
                                />
                            </div>
                            {errors['academics.twelfth'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['academics.twelfth']}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CPI</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SparklesIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="academics.cpi"
                                    value={studentData.academics?.cpi || ''}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 p-2 border rounded-md ${errors['academics.cpi'] ? 'border-red-500' : ''}`}
                                    disabled={!isEditing}
                                    min="0"
                                    max="10"
                                />
                            </div>
                            {errors['academics.cpi'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['academics.cpi']}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Marksheets Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 pb-2 border-b">
                        <DocumentTextIcon className="h-6 w-6 inline-block mr-2 text-primary" />
                        Marksheets & PDFs
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 10th */}
                        <div>
                            <h3 className="font-semibold mb-2">10th Marksheet</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const formData = new FormData(form);
                                try {
                                    const token = localStorage.getItem('token');
                                    await axios.post('http://localhost:5000/api/students/marksheets/tenth', formData, { headers: { 'x-auth-token': token } });
                                    toast.success('10th marksheet uploaded');
                                } catch (err) {
                                    console.error(err);
                                    toast.error(err.response?.data?.msg || 'Upload failed');
                                }
                            }} className="space-y-3">
                                <input name="percentage" type="number" step="0.01" min="0" max="100" placeholder="Percentage" className="w-full p-2 border rounded" required />
                                <input name="pdf" type="file" accept="application/pdf" className="w-full p-2 border rounded" required />
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Upload 10th PDF</button>
                            </form>
                            {studentData.marksheets?.tenth?.pdfUrl && (
                                <div className="mt-3">
                                    <a href={studentData.marksheets.tenth.pdfUrl} target="_blank" rel="noreferrer" className="text-primary underline">View 10th PDF</a>
                                </div>
                            )}
                        </div>

                        {/* Intermediate */}
                        <div>
                            <h3 className="font-semibold mb-2">Intermediate Marksheet</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const formData = new FormData(form);
                                try {
                                    const token = localStorage.getItem('token');
                                    await axios.post('http://localhost:5000/api/students/marksheets/inter', formData, { headers: { 'x-auth-token': token } });
                                    toast.success('Intermediate marksheet uploaded');
                                } catch (err) {
                                    console.error(err);
                                    toast.error(err.response?.data?.msg || 'Upload failed');
                                }
                            }} className="space-y-3">
                                <input name="percentage" type="number" step="0.01" min="0" max="100" placeholder="Percentage" className="w-full p-2 border rounded" required />
                                <input name="pdf" type="file" accept="application/pdf" className="w-full p-2 border rounded" required />
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Upload Inter PDF</button>
                            </form>
                            {studentData.marksheets?.inter?.pdfUrl && (
                                <div className="mt-3">
                                    <a href={studentData.marksheets.inter.pdfUrl} target="_blank" rel="noreferrer" className="text-primary underline">View Inter PDF</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Semesters */}
                    <div className="mt-8">
                        <h3 className="font-semibold mb-2">Semester-wise Marksheet</h3>
                        {/* Quick SGPA inputs for 8 semesters (optional convenience) */}
                        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[1,2,3,4,5,6,7,8].map(n => (
                                <div key={n} className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 w-14">Sem {n}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        value={semSgpa[n] ?? ''}
                                        onChange={(e) => setSemSgpa(prev => ({ ...prev, [n]: e.target.value }))}
                                        className="p-2 border rounded w-24"
                                        placeholder="SGPA"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mb-6 text-sm text-text-secondary">
                            Computed CGPA up to entered semesters: <span className="font-semibold text-text-primary">{computedCgpa || '—'}</span>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const formData = new FormData(form);
                            try {
                                const token = localStorage.getItem('token');
                                await axios.post('http://localhost:5000/api/students/marksheets/semester', formData, { headers: { 'x-auth-token': token } });
                                toast.success('Semester marksheet uploaded');
                            } catch (err) {
                                console.error(err);
                                toast.error(err.response?.data?.msg || 'Upload failed');
                            }
                        }} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <input name="sem" type="number" min="1" max="12" placeholder="Semester" className="p-2 border rounded" required />
                            <input name="sgpa" type="number" step="0.01" min="0" max="10" placeholder="SGPA" className="p-2 border rounded" required />
                            <input name="backlogs" type="number" min="0" placeholder="Backlogs" className="p-2 border rounded" />
                            <input name="pdf" type="file" accept="application/pdf" className="p-2 border rounded" required />
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Upload Semester PDF</button>
                        </form>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {studentData.marksheets?.semesters?.map((s, idx) => (
                                <div key={idx} className="p-3 border rounded flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Semester {s.sem}</p>
                                        <p className="text-sm text-gray-600">SGPA: {s.sgpa} {typeof s.backlogs === 'number' ? `(Backlogs: ${s.backlogs})` : ''}</p>
                                    </div>
                                    <a className="text-primary underline" href={s.pdfUrl} target="_blank" rel="noreferrer">View PDF</a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CGPA Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 pb-2 border-b">
                        <AcademicCapIcon className="h-6 w-6 inline-block mr-2 text-primary" />
                        CGPA Certificate
                    </h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const fd = new FormData(form);
                        try {
                            const token = localStorage.getItem('token');
                            await axios.post('http://localhost:5000/api/students/marksheets/cgpa', fd, { headers: { 'x-auth-token': token } });
                            toast.success('CGPA certificate uploaded');
                        } catch (err) {
                            console.error(err);
                            toast.error(err.response?.data?.msg || 'Upload failed');
                        }
                    }} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <input name="value" type="number" step="0.01" min="0" max="10" placeholder="CGPA" className="p-2 border rounded" required />
                        <input name="pdf" type="file" accept="application/pdf" className="p-2 border rounded" required />
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Upload CGPA PDF</button>
                    </form>
                    {studentData.marksheets?.cgpa?.pdfUrl && (
                        <div className="mt-4">
                            <span className="mr-3 font-medium">Current CGPA: {studentData.marksheets.cgpa.value ?? '—'}</span>
                            <a href={studentData.marksheets.cgpa.pdfUrl} target="_blank" rel="noreferrer" className="text-primary underline">View CGPA PDF</a>
                        </div>
                    )}
                </div>

                {/* Skills Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 pb-2 border-b">
                        <CodeBracketIcon className="h-6 w-6 inline-block mr-2 text-primary" />
                        Skills & Expertise
                    </h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Skills (comma separated)</label>
                        <input
                            type="text"
                            value={studentData.skills?.join(', ') || ''}
                            onChange={(e) => {
                                const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
                                setStudentData(prev => ({
                                    ...prev,
                                    skills
                                }));
                            }}
                            className="w-full p-2 border rounded-md"
                            disabled={!isEditing}
                            placeholder="e.g., React, Node.js, Python"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {studentData.skills?.map((skill, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentProfilePage;