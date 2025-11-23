import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useAuthFetch = (url) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // useCallback ensures this function is not recreated on every render
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Authentication token not found. Please log in.");
            }

            const config = {
                headers: {
                    'x-auth-token': token,
                },
            };

            const res = await axios.get(url, config);
            setData(res.data);

        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.message || 'An unknown error occurred.';
            setError(errorMsg);
            toast.error(errorMsg);
            console.error("API Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [url]); // Dependency array: re-run if the URL changes

    // useEffect to run the fetch when the component mounts or the hook is called
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Return the state and a function to manually refetch data
    return { data, isLoading, error, refetch: fetchData };
};

export default useAuthFetch;