const pool = require('../config/db');

class TicketRepository {
    async getAllTickets() {
        const result = await pool.query(
            'SELECT * FROM ticket_troubleshoot ORDER BY date_created DESC'
        );
        return result.rows;
    }

    async getTicketById(id) {
        const result = await pool.query(
            'SELECT * FROM ticket_troubleshoot WHERE ticket_id = $1',
            [id]
        );
        return result.rows[0];
    }

    async createTicket(ticket) {
        const result = await pool.query(
            `INSERT INTO ticket_troubleshoot 
            (title, description, priority, status, reporter, assignee, category) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [ticket.title, ticket.description, ticket.priority, 
             ticket.status, ticket.reporter, ticket.assignee, ticket.category]
        );
        return result.rows[0];
    }

    async updateTicket(id, ticket) {
        const result = await pool.query(
            `UPDATE ticket_troubleshoot 
            SET title = $1, description = $2, priority = $3, 
                status = $4, assignee = $5, category = $6, 
                last_updated = CURRENT_TIMESTAMP 
            WHERE ticket_id = $7 
            RETURNING *`,
            [ticket.title, ticket.description, ticket.priority, 
             ticket.status, ticket.assignee, ticket.category, id]
        );
        return result.rows[0];
    }

    async deleteTicket(id) {
        const result = await pool.query(
            'DELETE FROM ticket_troubleshoot WHERE ticket_id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = new TicketRepository();