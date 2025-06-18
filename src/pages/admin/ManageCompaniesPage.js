import React, { useState, useEffect } from 'react';
import { 
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Typography, Link, Box, Button, CircularProgress, IconButton, Tooltip, Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useUsers } from '../../contexts/UserContext';
import AddCompanyDialog from './AddCompanyDialog';
import ResetCompanyPasswordDialog from './ResetCompanyPasswordDialog';

const ManageCompaniesPage = () => {
    const { API_URL } = useUsers();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [companyToReset, setCompanyToReset] = useState(null);

    const fetchCompanies = async () => {
        const token = localStorage.getItem('authToken');
        setError('');
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/companies/with-job-counts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || "Failed to fetch companies");
            }
            setCompanies(data);
        } catch (err) {
            console.error("Failed to fetch companies", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchCompanies();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleOpenResetDialog = (company) => {
        setCompanyToReset(company);
        setResetDialogOpen(true);
    };

    const handleCompanyAdded = (newCompany) => {
        // After adding, refresh the whole list to get correct sorting and counts
        fetchCompanies();
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>Manage Companies</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
                    Add New Company
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Company Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Open Jobs</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Last Posted</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : (
                            companies.map((company) => (
                                <TableRow key={company._id} hover>
                                    <TableCell>
                                        <Link component={RouterLink} to={`/admin/view-as-company/${company._id}/dashboard`}>
                                            {company.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{company.username}</TableCell>
                                    <TableCell align="center">{company.openJobCount}</TableCell>
                                    <TableCell>{company.latestJobPost ? new Date(company.latestJobPost).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Reset Password">
                                            <IconButton onClick={() => handleOpenResetDialog(company)}>
                                                <LockResetIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddCompanyDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} onSuccess={handleCompanyAdded} />
            <ResetCompanyPasswordDialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} company={companyToReset} />
        </>
    );
};

export default ManageCompaniesPage;