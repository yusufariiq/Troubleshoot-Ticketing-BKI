const ticketService = require('../services/ticketService');

class TicketController {
    async getAllTickets(req, res) {
        try {
            const tickets = await ticketService.getAllTickets();
            res.json(tickets);
        } catch (error) {
            res.status(500).json({ error: error.message });
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
            const newTicket = await ticketService.createTicket(req.body);
            res.status(201).json(newTicket);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateTicket(req, res) {
        try {
            const updatedTicket = await ticketService.updateTicket(req.params.id, req.body);
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