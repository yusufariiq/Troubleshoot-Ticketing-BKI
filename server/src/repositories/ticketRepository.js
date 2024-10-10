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
                `SELECT t.*, a.filename, a.original_name, a.mime_type
                FROM ticket_troubleshoot t
                LEFT JOIN ticket_attachments a ON t.attachment_id = a.id
                ORDER BY t.date_created DESC`
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
        try {
            const result = await pool.query(`
                SELECT 
                    t.*,
                    a.filename,
                    a.original_name,
                    a.mime_type
                FROM ticket_troubleshoot t
                LEFT JOIN ticket_attachments a ON t.attachment_id = a.id
                WHERE t.ticket_id = $1
            `, [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Database error in getTicketById:', error);
            throw error;
        }
    }

    async createTicket(ticket) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            let attachment_id = null;
            if (ticket.attachment) {
                const attachmentResult = await client.query(
                    `INSERT INTO ticket_attachments (filename, original_name, mime_type) 
                     VALUES ($1, $2, $3) 
                     RETURNING id`,
                    [ticket.attachment.filename, ticket.attachmentoriginal_name, ticket.attachment.mime_type]
                );
                attachment_id = attachmentResult.rows[0].id;
                console.log('Created new attachment with ID:', attachment_id);
            }

            const result = await client.query(
                `INSERT INTO ticket_troubleshoot 
                (title, description, priority, status, reporter, assignee, category, attachment_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING *`,
                [ticket.title, ticket.description, ticket.priority, 
                 ticket.status, ticket.reporter, ticket.assignee, ticket.category, attachment_id]
            );
            
            await client.query('COMMIT');
            return this.getTicketById(result.rows[0].ticket_id);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Database error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async updateTicket(id, ticket) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let attachment_id = null;
            let oldAttachmentId = null;

            const currentTicket = await client.query(
                'SELECT attachment_id FROM ticket_troubleshoot WHERE ticket_id = $1', [id]
            );

            if (currentTicket.rows[0]) {
                oldAttachmentId = currentTicket.rows[0].attachment_id;
            }

            if (ticket.attachment){
                const attachmentResult = await client.query(
                    `INSERT INTO ticket_attachments 
                    (filename, original_name, mime_type) 
                    VALUES ($1, $2, $3) 
                    RETURNING id`,
                    [
                        ticket.attachment.filename,
                        ticket.attachment.original_name,
                        ticket.attachment.mime_type
                    ]
                );
                attachment_id = attachmentResult.rows[0].id;
            } else if (ticket.delete_attachment) {
                attachment_id = null;
            } else if (ticket.attachment_id) {
                attachment_id = parseInt(ticket.attachment_id);
            }
            
            const result = await client.query(
                `UPDATE ticket_troubleshoot 
                SET title = $1, description = $2, priority = $3, 
                    status = $4, assignee = $5, category = $6, 
                    attachment_id = $7,
                    last_updated = CURRENT_TIMESTAMP 
                WHERE ticket_id = $8
                RETURNING ticket_id`,
                [
                    ticket.title, ticket.description, ticket.priority, 
                    ticket.status, ticket.assignee, ticket.category,
                    attachment_id, id
                ]
            ); 

            if (oldAttachmentId && oldAttachmentId !== attachment_id) {
            await client.query(
                'DELETE FROM ticket_attachments WHERE id = $1',
                [oldAttachmentId]
            );
        }

            const updatedTicket = await client.query(
                `SELECT t.*, a.filename, a.original_name, a.mime_type
                FROM ticket_troubleshoot t
                LEFT JOIN ticket_attachments a ON t.attachment_id = a.id
                WHERE t.ticket_id = $1`,
                [result.rows[0].ticket_id]
            );

            await client.query('COMMIT');
            return updatedTicket.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteTicket(id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const ticket = await this.getTicketById(id);

            const result = await client.query(
                'DELETE FROM ticket_troubleshoot WHERE ticket_id = $1 RETURNING *',
                [id]
            );

            if (ticket && ticket.attachment_id){
                await client.query(
                    `DELETE FROM ticket_attachments WHERE id = $1`, [ticket.attachment_id]
                );
            }

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteAttachment(attachmentId) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'DELETE FROM ticket_attachments WHERE id = $1 RETURNING filename',
                [attachmentId]
            );
            if (result.rows[0]) {
                const filePath = path.join(uploadDir, result.rows[0].filename);
                await fs.unlink(filePath);
                console.log(`Deleted file: ${filePath}`);
            }
        } catch (error) {
            console.error(`Error deleting attachment ${attachmentId}:`, error);
        } finally {
            client.release();
        }
    }
}

module.exports = new TicketRepository();