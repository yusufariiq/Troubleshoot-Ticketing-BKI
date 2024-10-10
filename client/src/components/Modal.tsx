import { useState, useCallback, useEffect } from 'react';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import {
    Alert,
    Button,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
  } from '@mui/material';
import Grid from '@mui/material/Grid';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const API_URL = import.meta.env.VITE_API_URL;

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Judul wajib diisi'),
  description: Yup.string().required('Deskripsi wajib diisi'),
  priority: Yup.string().required('Priority is required'),
  status: Yup.string().required('Status is required'),
  reporter: Yup.string().required('Pelapor wajib diisi'),
  category: Yup.string().required('Kategori wajib diisi')
});

interface TicketFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any, attachment: File | null) => Promise<void>;
  editingTicket: any | null;
}

const Modal: React.FC<TicketFormModalProps> = ({ open, onClose, onSubmit, editingTicket }) => {
  const [attachment, setAttachment] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleteAttachment, setIsDeleteAttachment] = useState<boolean>(false);
  
  useEffect(() => {
    if (!open) {
      setAttachment(null);
      setThumbnail(null);
      setSubmitError(null);
      setIsDeleteAttachment(false);
    }
  }, [open]);
  
  useEffect(() => {
    if (editingTicket?.filename) {
      setThumbnail(`${API_URL}/tickets/attachments/${editingTicket.filename}`);
    } else {
      setThumbnail(null);
        }
    }, [editingTicket]);

  const initialValues = editingTicket || {
    title: editingTicket?.title || '',
    description: editingTicket?.description || '',
    priority: editingTicket?.priority || 'Low',
    status: editingTicket?.status || 'Open',
    reporter: editingTicket?.reporter || '',
    assignee: editingTicket?.assignee || '',
    category: editingTicket?.category || '',
    attachment_id: editingTicket?.attachment_id || null
  };

  
  const handleSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
          if (values[key] !== undefined && values[key] !== null) {
              formData.append(key, values[key]);
          }
      });
      
      if (attachment) {
          formData.append('attachment', attachment);
      }

      if (editingTicket?.attachment_id && !attachment && !isDeleteAttachment) {
        formData.append('attachment_id', editingTicket.attachment_id.toString());
      }

      if (isDeleteAttachment) {
        formData.append('delete_attachment', 'true');
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
        console.error('Error submitting form:', error);
        setSubmitError('An error occurred while submitting the form. Please try again.');
    } finally {
        setSubmitting(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], setFieldValue: any) => {
    const file = acceptedFiles[0];
    if (file) {
        console.log('File dropped:', file);
        setAttachment(file);

        const reader = new FileReader();
            reader.onload = (e) => {
                setThumbnail(e.target?.result as string);
                setFieldValue("attachment_id", null);
            };
        reader.readAsDataURL(file);
    }
  }, []);

const handleRemoveFile = (setFieldValue: any) => {
  setAttachment(null);
  setThumbnail(null);
  setFieldValue("attachment_id", null);
  setIsDeleteAttachment(true);
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
                  {submitError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {submitError}
                    </Alert>
                  )}
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
                          <img 
                            src={thumbnail} 
                            alt="File preview" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px',
                              objectFit: 'contain' 
                            }} 
                          />
                          <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
                          <Typography variant="body2" mr={1}>
                            {attachment?.name || editingTicket?.original_name || "Current attachment"}
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
                  <Button type="submit" color="primary" >
                    {editingTicket ? 'Update' : 'Submit'}
                  </Button>
                  </DialogActions>
              </Form>
            )
          }}
      </Formik>
    </Dialog>
    )
}

export default Modal;