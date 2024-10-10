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
}

module.exports = new TicketService();