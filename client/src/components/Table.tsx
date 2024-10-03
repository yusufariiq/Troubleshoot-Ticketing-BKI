import { DataGrid, GridColDef} from '@mui/x-data-grid';
import { Box, Button, Container, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Tabs, Tab, TextField, Typography, SelectChangeEvent } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Troubleshoot {
    id?: number;
    title: string
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    reporter: string;
    assignee: string;
    date_created: string;
    last_updated: string;
    category: string;
    attachment_id: number
}

interface Attachment {
    id?: number;
    ticket_id: number;
    file_name: string;
    file_data: string;
    file_type: string;
    uploaded_at: string;
}


export default function Table() {
    const [data, setData] = useState<Troubleshoot[]>([]);

    const columns: GridColDef[] = [
        { field: 'ticket_id', headerName: 'ID', width:120 },
        { field: 'title', headerName: 'Judul', width:120 },
        { field: 'description', headerName: 'Deskripsi', width:120 },
        { field: 'priority', headerName: 'Level Prioritas', width:120 },
        { field: 'status', headerName: 'Status', width:120 },
        { field: 'reporter', headerName: 'Pelapor', width:120 },
        { field: 'assignee', headerName: 'PJ', width:120 },
        { field: 'date_created', headerName: 'Tanggal dibuat', width:120 },
        { field: 'last_updated', headerName: 'Update terbaru', width:120 },
        { field: 'category', headerName: 'Kategori', width:120 },
        { field: 'attachment_id', headerName: 'Lampiran', width:120 },
    ];

    const fetchData = async () => {
        try {
            const response = await axios.get<Troubleshoot[]>('http://localhost:5000/api/ticket-troubleshoot');
            const fetchedData = response.data.map((item: any) => {
                const cleanedItem = { ...item };
                Object.keys(cleanedItem).forEach((key) => {
                  if (cleanedItem[key] === null) {
                    cleanedItem[key] = '-';
                  }
                });
                return cleanedItem;
              });
            
            setData(fetchedData);
        } catch (error) {
            console.error('Error fetching data: ', error);
        } 
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Container>
            <Box sx={{mb:2}}>
                <Typography variant="h4" component="h5" >
                Troubleshoot Ticketing
                </Typography>
            </Box>
            <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.ticket_id}
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
        </Container>
    )
};
