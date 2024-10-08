const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/', upload.single('attachment'), ticketController.createTicket);
router.put('/:id', upload.single('attachment'), ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;