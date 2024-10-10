const ticketService = require('../services/ticketService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadDir}`);
}

const storage = multer.diskStorage({
     destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter(req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf' ];
        if(allowedTypes.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF are allowed'))
        }
    }
}).single('attachment');

class TicketController {
    async getAllTickets(req, res) {
        try {
            const tickets = await ticketService.getAllTickets();
            res.json(tickets);
        } catch (error) {
            console.error('Error in getAllTickets:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAttachment(req, res) {
        try {
            const filename = req.params.filename;
            
            if(!filename) {
                console.log('No filename provided');
                return res.status(400).json({error: 'No filename provided'})
            }

            const filepath = path.join(uploadDir, filename);

            try {
                await fs.access(filepath);
                const ext = path.extname(filename).toLowerCase();
                const contentType = {
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.pdf': 'application/pdf'
                }[ext] || 'application/octet-stream';
                
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Content-Disposition', 'inline');

                const fileStream = fsSync.createReadStream(filepath);
                fileStream.pipe(res);
                // res.sendFile(filepath);
            } catch (error) {
                console.log('File not found: ', filepath);
                return res.status(404).json({ 
                    error: 'File not found',
                    details: {
                        requestedFile: filename,
                        attemptedPath: filepath
                    }
                });
            }
        } catch (error) {
            console.error('Error serving attachment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getTicketById(req, res) {
        try {
            const ticket = await ticketService.getTicketById(req.params.id);
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }
            res.json(ticket);
        } catch (error) {
            console.error('Error in getTicketById:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createTicket(req, res) {
        try {
            await new Promise((resolve, reject) => {
                upload(req, res, function(err) {
                    if (err instanceof multer.MulterError) {
                        reject({ status: 400, message: `File upload error: ${err.message}` });
                    } else if (err) {
                        reject({ status: 400, message: err.message });
                    }
                    resolve();
                });
            });

            const ticketData = {
                title: req.body.title,
                description: req.body.description,
                priority: req.body.priority || 'Low',
                status: req.body.status || 'Open',
                reporter: req.body.reporter,
                assignee: req.body.assignee || null,
                category: req.body.category
            };

            if (req.file) {
                ticketData.attachment = {
                    filename: req.file.filename,
                    original_name: req.file.originalname,
                    mime_type: req.file.mimetype
                };
            }

            console.log('Creating ticket with data:', ticketData);

            const ticket = await ticketService.createTicket(ticketData);
            res.status(201).json(ticket);
        } catch (error) {
            console.error('Error in createTicket:', error);
            const status = error.status || 500;
            const message = error.message || 'Internal server error';
            res.status(status).json({ error: message });
        }
    }

    async updateTicket(req, res) {
        const handleUpload = () => {
            return new Promise((resolve, reject) => {
                upload(req, res, function(err) {
                    if (err) {
                        reject({ status: 400, message: `File upload error: ${err.message}` });
                    } else {
                        resolve();
                    }
                });
            });
        };

        try {
            await handleUpload();
            const existingTicket = await ticketService.getTicketById(req.params.id);
            if(!existingTicket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            const ticketData = {
                title: req.body.title,
                description: req.body.description,
                priority: req.body.priority,
                status: req.body.status,
                reporter: req.body.reporter,
                assignee: req.body.assignee || null,
                category: req.body.category,
            };

            if(req.file) {
                ticketData.attachment = {
                    filename: req.file.filename,
                    original_name: req.file.originalname,
                    mime_type: req.file.mimetype,
                };

                if (existingTicket.filename) {
                    const oldFilePath = path.join(uploadDir, existingTicket.filename);
                    try {
                        await fs.unlink(oldFilePath);
                        console.log(`Deleted old file: ${oldFilePath}`);
                    } catch (error) {
                        console.log(`Error deleting old file: ${oldFilePath}`, error);
                    }
                }
            } else if (req.body.delete_attachment === 'true') {
                ticketData.delete_attachment = true;
            } else if (existingTicket.attachment_id) {
                ticketData.attachment_id = existingTicket.attachment_id;
            }
            
            const ticket = await ticketService.updateTicket(req.params.id, ticketData);
            res.json(ticket);
        } catch (error) {
            console.error('Error updating ticket:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteTicket(req, res) {
        try {
            const ticket = await ticketService.deleteTicket(req.params.id);
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            if (ticket.filename) {
                const filePath = path.join(uploadDir, ticket.filename);
                try {
                    await fs.unlink(filePath);
                    console.log(`Deleted file: ${filePath}`);
                } catch (error) {
                    console.error(`Error deleting file: ${filePath}`, error);
                }
            }

            const deletedTicket = await ticketService.deleteTicket(req.params.id);
            res.json(deletedTicket);
        } catch (error) {
            console.error('Error in deleteTicket:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new TicketController();