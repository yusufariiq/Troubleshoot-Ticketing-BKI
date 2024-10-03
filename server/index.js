const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const fs = require('fs');
const cors = require('cors')

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bki',
    password: '1234',
    port: 5432,
});  

app.get('/api/ticket-troubleshoot', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ticket_troubleshoot ORDER BY date_created DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/', (req, res) => {
    res.json({ message: 'Hello from Vercel!' });
});

// // Konfigurasi multer untuk menangani file upload
// const upload = multer({ dest: 'uploads/' });

// // Endpoint untuk mengunggah file
// app.post('/api/troubleshoot-ticket/upload', upload.single('file'), async (req, res) => {
//   const { ticket_id } = req.body;
//   const file = req.file;

//   try {
//     const fileData = fs.readFileSync(file.path);

//     const query = `
//       INSERT INTO ticket_attachments (ticket_id, file_name, file_data, file_type)
//       VALUES ($1, $2, $3, $4)
//     `;
//     await pool.query(query, [ticket_id, file.originalname, fileData, file.mimetype]);

//     fs.unlinkSync(file.path);

//     res.json({ message: 'File uploaded and saved to database!' });
//   } catch (error) {
//     console.error('Error saving file:', error);
//     res.status(500).json({ error: 'Failed to upload file' });
//   }
// });

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

