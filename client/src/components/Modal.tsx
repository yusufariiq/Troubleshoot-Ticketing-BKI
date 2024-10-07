import { useState, useCallback } from 'react';
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
    InputLabel,
    Box,
    IconButton,
  } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
}

const Modal: React.FC<TicketFormModalProps> = ({ open, onClose, onSubmit }) => {
  const [attachment, setAttachment] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  
  const initialValues: Troubleshoot = {
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
  
   const handleSubmit = async (values: Troubleshoot, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      const ticketResponse = await submitTroubleshootTicket(values);
      const newTicketId = ticketResponse.ticket_id;

      if (attachment) {
        const attachmentData: Attachment = {
          ticket_id: newTicketId,
          file_name: attachment.name,
          file_data: await fileToBase64(attachment),
          file_type: attachment.type,
          uploaded_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };
        const attachmentResponse = await uploadAttachment(attachmentData);
        await updateTicketAttachment(newTicketId, attachmentResponse.id);
      }

      onSubmit(values);
      onClose();
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      console.log('Ticket submitted successfully');
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
      <DialogTitle>Create Ticket</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, setFieldValue }) => {
          const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop: (files) => onDrop(files, setFieldValue),
            multiple: false
          });

          return (
              <Form>
                <DialogContent>
                  <Field
                    as={TextField}
                    name="title"
                    label="Title"
                    fullWidth
                    margin="normal"
                    error={touched.title && errors.title}
                    helperText={touched.title && errors.title}
                  />
                  <Field
                    as={TextField}
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    error={touched.description && errors.description}
                    helperText={touched.description && errors.description}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Priority</InputLabel>
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
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
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
                  <Field
                    as={TextField}
                    name="reporter"
                    label="Reporter"
                    fullWidth
                    margin="normal"
                    error={touched.reporter && errors.reporter}
                    helperText={touched.reporter && errors.reporter}
                  />
                  <Field
                    as={TextField}
                    name="assignee"
                    label="Assignee"
                    fullWidth
                    margin="normal"
                    error={touched.assignee && errors.assignee}
                    helperText={touched.assignee && errors.assignee}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box sx={{display:'flex', justifyContent:'space-between' }}>
                      <Field
                        name="date_created"
                        component={DatePicker}
                        label="Date Created"
                        inputFormat="MM/dd/yyyy"
                        renderInput={(params: any) => <TextField {...params} fullWidth margin="normal" />}
                      />
                      <Field
                        name="last_updated"
                        component={DatePicker}
                        label="Last Updated"
                        inputFormat="MM/dd/yyyy"
                        renderInput={(params: any) => <TextField {...params} fullWidth margin="normal" />}
                      />
                    </Box>
                  </LocalizationProvider>
                  <Field
                    as={TextField}
                    name="category"
                    label="Category"
                    fullWidth
                    margin="normal"
                    error={touched.category && errors.category}
                    helperText={touched.category && errors.category}
                  />
                  <Box 
                    {...getRootProps()}
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      padding: 3,
                      marginTop: 2,
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
                </DialogContent>
                <DialogActions>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button type="submit" variant="contained" color="primary">
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