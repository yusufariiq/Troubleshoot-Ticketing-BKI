import axios from 'axios';
import * as Yup from 'yup';
import React, { useState } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
  } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

import Troubleshoot from '../interface/Troubleshoot';
import Attachment from '../interface/Attachment';

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
    const [data, setData] = useState<Troubleshoot[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);


    const handleSubmit = (values: Troubleshoot, { setSubmitting }: any) => {
        onSubmit(values);
        setSubmitting(false);
        onClose();
    };

    return (
<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create/Edit Ticket</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, setFieldValue }) => (
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
              <Box mt={2}>
                <input
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    setFieldValue("attachment", file);
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFilePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setFilePreview(null);
                    }
                  }}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="contained" component="span">
                    Upload Attachment
                  </Button>
                </label>
                {filePreview && (
                  <Box mt={2}>
                    <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  </Box>
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
        )}
      </Formik>
    </Dialog>
    )
}

export default Modal;