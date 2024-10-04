class Ticket {
    constructor(ticket) {
        this.ticket_id = ticket.ticket_id;
        this.title = ticket.title;
        this.description = ticket.description;
        this.priority = ticket.priority;
        this.status = ticket.status;
        this.reporter = ticket.reporter;
        this.assignee = ticket.assignee;
        this.date_created = ticket.date_created;
        this.last_updated = ticket.last_updated;
        this.category = ticket.category;
        this.attachment_id = ticket.attachment_id;
    }
}

module.exports = Ticket;