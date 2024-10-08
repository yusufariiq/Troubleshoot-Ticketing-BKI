const ticketRepository = require('../repositories/ticketRepository');

class TicketService {
    async getAllTickets() {
        return await ticketRepository.getAllTickets();
    }

    async getTicketById(id) {
        return await ticketRepository.getTicketById(id);
    }

    async createTicket(ticketData) {
        return await ticketRepository.createTicket(ticketData);
    }

    async updateTicket(id, ticketData) {
        return await ticketRepository.updateTicket(id, ticketData);
    }

    async deleteTicket(id) {
        return await ticketRepository.deleteTicket(id);
    }
    
    async createAttachment(attachmentData) {
        return await ticketRepository.createAttachment(attachmentData);
    }

    async updateAttachment(id, attachmentData) {
        return await ticketRepository.updateAttachment(id, attachmentData);
    }

    async deleteAttachment(id) {
        return await ticketRepository.deleteAttachment(id);
    }
}

module.exports = new TicketService();