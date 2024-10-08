import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Box,
    IconButton,
  } from '@mui/material';
import Grid from '@mui/material/Grid';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';

import Troubleshoot from '../interface/Troubleshoot';
import Attachment from '../interface/Attachment';

const validationSchema = Yup.object().shape({
    troubleshoot: Yup.object().shape({
        title: Yup.string().required('Judul wajib diisi'),description: Yup.string().required('Deskripsi wajib diisi'),
        priority: Yup.string().oneOf(['Low', 'Medium', 'High', 'Critical']).required('Required'),
        status: Yup.string().oneOf(['Open', 'In Progress', 'Resolved', 'Closed']).required('Required'),
        reporter: Yup.string().required('Wajib mengisi nama pelapor'),
        category: Yup.string().required('Kategori wajib diisi')
    })
})

interface TicketFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: Troubleshoot) => void;
    editingTIcket: Troubleshoot | null;
}

const Modal: React.FC<TicketFormModalProps> = ({ open, onClose, onSubmit, editingTicket }) => {
  const [attachment, setAttachment] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  
  const initialValues: Troubleshoot = editingTicket || {
    ticket_id: 0,
    title: '',
    description: '',
    priority: 'Low',
    status: 'Open',
    reporter: '',
    assignee: '',
    date_created: format(new Date(), 'yyyy-MM-dd'),
    last_updated: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    attachment_id: null
};

   useEffect(() => {
    if (editingTicket && editingTicket.attachment_id) {
      // Fetch attachment details if needed
      // Set thumbnail if it's an image
    }
  }, [editingTicket]);
  
  const handleSubmit = async (values: Troubleshoot, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    console.log("Submit button clicked");
    console.log("Form values:", values);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'attachment' && values[key] instanceof File) {
          formData.append('attachment', values[key]);
        } else {
          formData.append(key, String(values[key] || ''));
        }
      });
  
      if (editingTicket) {
        await axios.put(`${API_URL}/tickets/${editingTicket.ticket_id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API_URL}/tickets`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onClose();
      fetchData();
    } catch (error) {
      console.error('Error saving ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitTroubleshootTicket = async (ticket: Troubleshoot): Promise<{ ticket_id: number }> => {
    const response = await axios.post('/api/tickets', ticket);
    return response.data;
  };

  const uploadAttachment = async (attachment: Attachment): Promise<{ id: number }> => {
    const response = await axios.post('/api/attachments', attachment);
    return response.data;
  };

  const updateTicketAttachment = async (ticketId: number, attachmentId: number): Promise<void> => {
    await axios.patch(`/api/tickets/${ticketId}`, { attachment_id: attachmentId });
  };

  const onDrop = useCallback((acceptedFiles: any, setFieldValue: any) => {
    const file = acceptedFiles[0];
    setAttachment(file);
    setFieldValue("attachment_id", file.name);
      
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setThumbnail(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setThumbnail(null);
    }
  }, []);

  const handleRemoveFile = (setFieldValue: any) => {
    setAttachment(null);
    setThumbnail(null);
    setFieldValue("attachment_id", null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingTicket ? 'Edit Ticket' : 'Create Ticket'}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, setFieldValue }) => {
          const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop: (files) => onDrop(files, setFieldValue),
            multiple: false
          });

          return (
              <Form>
                <DialogContent>
                  <Grid container spacing={3}>  
                    <Grid item xs={12}>
                      <label>Judul</label>
                      <Field
                        as={TextField}
                        name="title"
                        placeholder='Judul'
                        fullWidth
                        error={touched.title && errors.title}
                        helperText={touched.title && errors.title}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <label>Deskripsi</label>
                      <Field
                      as={TextField}
                      name="description"
                      placeholder='Deskripsi'
                      fullWidth
                      multiline
                      rows={4}
                      error={touched.description && errors.description}
                      helperText={touched.description && errors.description}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <label>Priority</label>
                        <Field
                          as={Select}
                          name="priority"
                          label="Priority"
                        >
                          <MenuItem value="Low">Low</MenuItem>
                          <MenuItem value="Medium">Medium</MenuItem>
                          <MenuItem value="High">High</MenuItem>
                          <MenuItem value="Critical">Critical</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <label>Status</label>
                        <Field
                          as={Select}
                          name="status"
                          label="Status"
                        >
                          <MenuItem value="Open">Open</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Resolved">Resolved</MenuItem>
                          <MenuItem value="Closed">Closed</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <label>Pelapor</label>
                      <Field
                      as={TextField}
                      name="reporter"
                      placeholder='Pelapor'
                      fullWidth
                      error={touched.reporter && errors.reporter}
                      helperText={touched.reporter && errors.reporter}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <label>Penanggung Jawab</label>
                      <Field
                      as={TextField}
                      name="assignee"
                      placeholder='Penanggung Jawab'
                      fullWidth
                      error={touched.assignee && errors.assignee}
                      helperText={touched.assignee && errors.assignee}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <label>Tanggal dibuat</label>
                            <Field
                              name="date_created"
                              component={DatePicker}
                              inputFormat="yyyy-MM-dd"
                              renderInput={(params: any) => <TextField {...params} fullWidth />}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <label>Updater terakhir</label>
                            <Field
                              name="last_updated"
                              component={DatePicker}
                              inputFormat="MM/dd/yyyy"
                              renderInput={(params: any) => <TextField {...params} fullWidth />}
                            />
                          </Grid>
                        </Grid>
                      </LocalizationProvider>
                    </Grid>
                  
                  <Grid item xs={12}>
                    <label>Kategori</label>
                    <Field
                        as={TextField}
                        name="category"
                        placeholder='Kategori'
                        fullWidth
                        error={touched.category && errors.category}
                        helperText={touched.category && errors.category}
                      />
                  </Grid>

                  <Grid item xs={12}>
                    <Box 
                      {...getRootProps()}
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        padding: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? '#f0f0f0' : 'transparent',
                      }}
                    >                 
                      <input {...getInputProps()} />
                      { thumbnail ? (
                        <Box>
                          <img src={thumbnail} alt="File thumbnail" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                          <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
                            <Typography variant="body2" mr={1}>
                              {attachment?.name || "File selected"}
                            </Typography>
                            <IconButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(setFieldValue);
                              }}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <label htmlFor="raised-button-file">
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', marginBottom: 1 }} />
                            <Typography variant="body1" gutterBottom>
                              Drag & Drop or Select file
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Drop files here or click <span style={{ color: '#1976d2', cursor: 'pointer' }}>browse</span> through your device
                            </Typography>
                          </label>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid> 
                </DialogContent>
                <DialogActions>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button type="submit" color="primary">
                    Submit
                  </Button>
                </DialogActions>
              </Form>
            )
            }
          }
      </Formik>
    </Dialog>
    )
}

export default Modal;