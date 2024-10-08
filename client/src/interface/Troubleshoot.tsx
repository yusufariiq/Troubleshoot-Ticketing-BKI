export default interface Troubleshoot {
    ticket_id: number;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    reporter: string;
    assignee: string;
    date_created: string | Date;
    last_updated: string | Date;
    category: string;
    attachment_id: File | null;
}