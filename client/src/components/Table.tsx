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
} from '@mui/material';

import { useState, useEffect } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import axios from 'axios';
import Troubleshoot from '../interface/Troubleshoot';
import Modal from './Modal';

export default function Table() {
    const [data, setData] = useState<Troubleshoot[]>([]);
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const columns: GridColDef[] = [
        { field: 'ticket_id', headerName: 'ID', width:50 },
        {
            field: 'actions',
            headerName: 'Aksi',
            width: 200,
            renderCell: () => (
              <Box>
                <Button>
                    <EditIcon />
                </Button>
                <Button>
                    <DeleteForeverIcon />
                </Button>
              </Box>
            ),
          },
        { field: 'title', headerName: 'Judul', width:200 },
        { field: 'description', headerName: 'Deskripsi', width:400 },
        { field: 'priority', headerName: 'Level Prioritas', width:120 },
        { field: 'status', headerName: 'Status', width:120 },
        { field: 'reporter', headerName: 'Pelapor', width:120 },
        { field: 'assignee', headerName: 'PJ', width:120 },
        {
            field: 'date_created', 
            headerName: 'Tanggal dibuat', 
            width: 180,
        },
        { 
            field: 'last_updated', 
            headerName: 'Update terbaru', 
            width: 180,
        },
        { field: 'category', headerName: 'Kategori', width: 130 },
        { 
            field: 'attachment_id', 
            headerName: 'Lampiran', 
            width: 100,
        },
    ];

    const fetchData = async () => {
        try {
            const response = await axios.get<Troubleshoot[]>('http://localhost:5000/api/tickets');
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

    const handleSubmit = (values: any) => {
        console.log(values);
        // Lakukan sesuatu dengan data form, seperti mengirim ke server
      };

    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{p:1}}>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector slotProps={{ tooltip: { title: 'Change density' } }}/>
                <GridToolbarExport
                    slotProps={{
                    tooltip: { title: 'Export data' },
                    }}
                />
            </GridToolbarContainer>
        )
    }

    return (
        <Container>
            <Box sx={{mb:2}}>
                <Typography variant="h4" component="h5" >
                Troubleshoot
                </Typography>
            </Box>
            <Paper variant="outlined" sx={{padding:'20px'}} >
                <Box sx={{marginBottom:1}}> 
                <Button
                variant="contained"
                sx={{ textTransform: 'none' }}
                onClick={handleOpen}
                >
                Add
                </Button>
                <Modal 
                    open={open}
                    onClose={handleClose}
                    onSubmit={handleSubmit} 
                />
                </Box>
                    <DataGrid
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.ticket_id}
                    sx={{
                        border:'none',
                        bgcolor: '#fff',
                        '& .MuiDataGrid-cell': {
                            bgcolor: '#fff',
                            border:'none',
                            },
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#f5f5f5',
                            },
                        }}
                    slots={{
                        toolbar: CustomToolbar
                    }}                
                    />
            </Paper>
        </Container>
        )
};