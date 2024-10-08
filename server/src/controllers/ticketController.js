const ticketService = require('../services/ticketService');

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

    async getTicketById(req, res) {
        try {
            const ticket = await ticketService.getTicketById(req.params.id);
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }
            res.json(ticket);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createTicket(req, res) {
        try {
            const ticketData = req.body;
            const file = req.file;

            let attachmentId = null;
            if (file) {
                const attachmentData = {
                    file_name: file.originalname,
                    file_path: file.path,
                    file_type: file.mimetype,
                    uploaded_at: new Date()
                };
                const attachment = await ticketService.createAttachment(attachmentData);
                attachmentId = attachment.id;
            }

            const ticketWithAttachment = {
                ...ticketData,
                attachment_id: attachmentId
            };

            const newTicket = await ticketService.createTicket(ticketWithAttachment);
            res.status(201).json(newTicket);
        } catch (error) {
            console.error('Error in createTicket:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async updateTicket(req, res) {
        try {
            const ticketData = req.body;
            const file = req.file;
            const ticketId = req.params.id;

            if (file) {
                const attachmentData = {
                    file_name: file.originalname,
                    file_path: file.path,
                    file_type: file.mimetype,
                    uploaded_at: new Date()
                };

                const existingTicket = await ticketService.getTicketById(ticketId);
                if (existingTicket.attachment_id) {
                    await ticketService.updateAttachment(existingTicket.attachment_id, attachmentData);
                } else {
                    const attachment = await ticketService.createAttachment(attachmentData);
                    ticketData.attachment_id = attachment.id;
                }
            }

            const updatedTicket = await ticketService.updateTicket(ticketId, ticketData);
            if (!updatedTicket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }
            res.json(updatedTicket);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteTicket(req, res) {
        try {
            const deletedTicket = await ticketService.deleteTicket(req.params.id);
            if (!deletedTicket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }
            res.json({ message: 'Ticket deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new TicketController();