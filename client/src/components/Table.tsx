import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Container, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Troubleshoot {
    ticket_id: number;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    reporter: string;
    assignee: string;
    date_created: string;
    last_updated: string;
    category: string;
    attachment_id: number | null;
}

export default function Table() {
    const [data, setData] = useState<Troubleshoot[]>([]);
    const [loading, setLoading] = useState(true);

    const columns: GridColDef[] = [
        { field: 'ticket_id', headerName: 'ID', width: 70 },
        { field: 'title', headerName: 'Judul', width: 130 },
        { field: 'description', headerName: 'Deskripsi', width: 200 },
        { field: 'priority', headerName: 'Level Prioritas', width: 130 },
        { field: 'status', headerName: 'Status', width: 130 },
        { field: 'reporter', headerName: 'Pelapor', width: 130 },
        { field: 'assignee', headerName: 'PJ', width: 130 },
        { 
            field: 'date_created', 
            headerName: 'Tanggal dibuat', 
            width: 180,
            valueFormatter: (params) => {
                return params.value ? new Date(params.value).toLocaleString() : '';
            }
        },
        { 
            field: 'last_updated', 
            headerName: 'Update terbaru', 
            width: 180,
            valueFormatter: (params) => {
                return params.value ? new Date(params.value).toLocaleString() : '';
            }
        },
        { field: 'category', headerName: 'Kategori', width: 130 },
        { 
            field: 'attachment_id', 
            headerName: 'Lampiran', 
            width: 100,
            valueFormatter: (params) => {
                return params.value != null ? 'Yes' : 'No';
            }
        },
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Troubleshoot[]>('http://localhost:5000/api/tickets');
            console.log('API Response:', response.data);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Container>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Troubleshoot Ticketing
                </Typography>
            </Box>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.ticket_id}
                    loading={loading}
                    sx={{
                        bgcolor: '#fff',
                        '& .MuiDataGrid-cell': {
                            bgcolor: '#fff',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#f5f5f5',
                        },
                    }}
                />
            </Box>
        </Container>
    );
};