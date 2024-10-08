import { 
    DataGrid, 
    GridColDef, 
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridToolbarDensitySelector
} from '@mui/x-data-grid';

import { 
    Box, 
    Button, 
    Container, 
    Paper, 
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';

import { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import axios from 'axios';
import Troubleshoot from '../interface/Troubleshoot';
import Modal from './Modal';

const API_URL = import.meta.env.VITE_API_URL

export default function Table() {
    const [data, setData] = useState<Troubleshoot[]>([]);
    const [open, setOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Troubleshoot | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

    const handleOpen = (ticket?: Troubleshoot) => {
        setEditingTicket(ticket || null);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingTicket(null);
    };

    const columns: GridColDef[] = [
        { field: 'ticket_id', headerName: 'ID', width: 50 },
        {
            field: 'actions',
            headerName: 'Aksi',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <Button onClick={() => handleOpen(params.row)}>
                        <EditIcon />
                    </Button>
                    <Button onClick={() => handleDeleteClick(params.row.ticket_id)}>
                        <DeleteForeverIcon />
                    </Button>
                </Box>
            ),
        },
        { field: 'title', headerName: 'Judul', width: 200 },
        { field: 'description', headerName: 'Deskripsi', width: 400 },
        { field: 'priority', headerName: 'Level Prioritas', width: 120 },
        { field: 'status', headerName: 'Status', width: 120 },
        { field: 'reporter', headerName: 'Pelapor', width: 120 },
        { field: 'assignee', headerName: 'PJ', width: 120 },
        { field: 'date_created', headerName: 'Tanggal dibuat', width: 180 },
        { field: 'last_updated', headerName: 'Update terbaru', width: 180 },
        { field: 'category', headerName: 'Kategori', width: 130 },
        { field: 'attachment_id', headerName: 'Lampiran', width: 100 },
    ];

    const fetchData = async () => {
        try {
            const response = await axios.get<Troubleshoot[]>(`${API_URL}/tickets`);
            const fetchedData = response.data.map((item: any) => ({
                ...item,
                ...Object.fromEntries(
                    Object.entries(item).map(([key, value]) => [key, value ?? '-'])
                ),
            }));
            setData(fetchedData);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (values: Troubleshoot) => {
        try {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (key === 'attachment' && values[key] instanceof File) {
                    formData.append('attachment', values[key]);
                } else {
                    formData.append(key, values[key]?.toString() || '');
                }
            });

            if (editingTicket) {
                // Update existing ticket
                await axios.put(`${API_URL}/tickets/${editingTicket.ticket_id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Create new ticket
                await axios.post(`${API_URL}/tickets`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }
            handleClose();
            fetchData(); // Refresh the data
        } catch (error) {
            console.error('Error saving ticket:', error);
        }
    };

    const handleDeleteClick = (ticketId: number) => {
        setTicketToDelete(ticketId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (ticketToDelete) {
            try {
                await axios.delete(`${API_URL}/tickets/${ticketToDelete}`);
                fetchData(); // Refresh the data
            } catch (error) {
                console.error('Error deleting ticket:', error);
            }
        }
        setDeleteDialogOpen(false);
        setTicketToDelete(null);
    };

    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{p:1}}>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    return (
        <Container>
            <Box sx={{mb:2}}>
                <Typography variant="h4" component="h5">
                    Troubleshoot
                </Typography>
            </Box>
            <Paper variant="outlined" sx={{padding:'20px'}}>
                <Box sx={{marginBottom:1}}> 
                    <Button
                        variant="contained"
                        sx={{ textTransform: 'none' }}
                        onClick={() => handleOpen()}
                    >
                        Add
                    </Button>
                </Box>
                <DataGrid
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.ticket_id}
                    slots={{
                        toolbar: CustomToolbar
                    }}
                    sx={{
                        border: 'none',
                        bgcolor: '#fff',
                        '& .MuiDataGrid-cell': {
                            bgcolor: '#fff',
                            border: 'none',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#f5f5f5',
                        },
                    }}
                />
                <Modal 
                    open={open}
                    onClose={handleClose}
                    onSubmit={handleSubmit}
                    editingTicket={editingTicket}
                />
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this ticket?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}