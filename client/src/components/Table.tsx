import { 
    DataGrid, 
    GridColDef, 
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridToolbarDensitySelector,
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
import axios from 'axios';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import Troubleshoot from '../interface/Troubleshoot';
import Attachment from '../interface/Attachment';
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

    const handleSubmit = async (values: FormData) => {
        try {

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            
            if (editingTicket) {
                await axios.put(
                    `${API_URL}/tickets/${editingTicket.ticket_id}`,
                    values,
                    config
                );
            } else {
                await axios.post(`${API_URL}/tickets`, values, config);
            }

            handleClose();
            fetchData();
        } catch (error) {
            console.error('Error saving ticket:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingTicket(null);
    };

    const handleDownload = async (filename: string) => {
        try{
            const response = await axios.get(`${API_URL}/tickets/attachments/${filename}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);

            document.body.appendChild(link);

            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error){
            console.error('Error downloading attachment:', error);
        }
    }

    const columns: GridColDef[] = [
        { 
            field: 'index', 
            headerName: 'No', 
            width: 50,
            renderCell(params) {
                return params.row.index;
            },
        },
        {
            field: 'actions',
            headerName: 'Aksi',
            width: 220,
            renderCell: (params) => (
                <>
                    <Button onClick={() => handleOpen(params.row)}>
                        <EditIcon />
                    </Button>
                    <Button onClick={() => handleDeleteClick(params.row.ticket_id)}>
                        <DeleteForeverIcon />
                    </Button>
                    {params.row.filename && (
                        <Button 
                            onClick={() => handleDownload(params.row.filename)}
                            title="Download attachment"
                        >
                            <DownloadIcon />
                        </Button>
                    )}
                </>
            ),
        },
        { field: 'title', headerName: 'Judul', width: 200 },
        { field: 'description', headerName: 'Deskripsi', width: 400 },
        { field: 'priority', headerName: 'Level Prioritas', width: 120 },
        { field: 'status', headerName: 'Status', width: 120, },
        { field: 'reporter', headerName: 'Pelapor', width: 120 },
        { field: 'assignee', headerName: 'PJ', width: 120 },
        { field: 'date_created', headerName: 'Tanggal dibuat', width: 180 },
        { field: 'last_updated', headerName: 'Update terbaru', width: 180 },
        { field: 'category', headerName: 'Kategori', width: 130 },
        { 
            field: 'attachment_id', 
            headerName: 'Lampiran', 
            width: 150,
            renderCell: (params) => {
                if (params.row.filename) {
                    return (
                        <Box
                            component="img"
                            sx={{
                                height: 50,
                                width: 50,
                                objectFit: 'cover',
                                cursor: 'pointer'
                            }}
                            alt={params.row.original_name}
                            src={`${API_URL}/tickets/attachments/${params.row.filename}`}
                            onClick={() => window.open(`${API_URL}/tickets/attachments/${params.row.filename}`, '_blank')}
                        >
                        </Box>
                        
                    );
                }
                return null;
            }
        },
    ];

    const fetchData = async () => {
        try {
            const response = await axios.get<Troubleshoot[]>(`${API_URL}/tickets`);
            const fetchedData = response.data.map((ticket, index) => ({
                ...ticket,
                index: index + 1,
                attachment: null
            }));
            setData(fetchedData);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (ticketId: number) => {
        setTicketToDelete(ticketId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (ticketToDelete) {
            try {
                await axios.delete(`${API_URL}/tickets/${ticketToDelete}`);
                fetchData();
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