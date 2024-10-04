const pool = require('../config/db');

class TicketRepository {
    async setupDatabase() {
        const primaryKey = await this.checkPrimaryKey();
        if (primaryKey.length > 0) {
            console.log('Primary key already exists:', primaryKey[0].constraint_name);
        } else {
            console.log('Warning: No primary key found on ticket_troubleshoot table');
        }
        
        await this.setupForeignKey();
        console.log('Database setup complete');
    }
    
    async getAllTickets() {
        try {
            const result = await pool.query(
                'SELECT ticket_id, title, description, priority, status, reporter, assignee, ' +
                'date_created, last_updated, category, attachment_id ' +
                'FROM ticket_troubleshoot ORDER BY date_created DESC'
            );
            return result.rows;
        } catch (error) {
            console.error('Database error in getAllTickets:', error);
            throw error;
        }
    }
    
    async checkPrimaryKey() {
        const result = await pool.query(`
            SELECT constraint_name, column_name 
            FROM information_schema.key_column_usage 
            WHERE table_name = 'ticket_troubleshoot' AND constraint_name LIKE '%pkey';
        `);
        console.log('Existing primary key:', result.rows);
        return result.rows;
    }

    async checkForeignKey() {
        const result = await pool.query(`
            SELECT constraint_name, column_name 
            FROM information_schema.key_column_usage 
            WHERE table_name = 'ticket_troubleshoot' AND constraint_name = 'fk_ticket_attachment';
        `);
        console.log('Existing foreign key:', result.rows);
        return result.rows;
    }
    
    async setupForeignKey() {
        try {
            const existingForeignKey = await this.checkForeignKey();
            if (existingForeignKey.length === 0) {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS attachments (
                        id SERIAL PRIMARY KEY
                    );
    
                    ALTER TABLE ticket_troubleshoot
                    ADD CONSTRAINT fk_ticket_attachment
                    FOREIGN KEY (attachment_id) REFERENCES attachments(id);
                `);
                console.log('Foreign key constraint added successfully');
            } else {
                console.log('Foreign key constraint already exists');
            }
        } catch (error) {
            console.error('Error setting up foreign key:', error);
            throw error;
        }
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