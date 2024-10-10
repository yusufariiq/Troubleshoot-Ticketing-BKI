export default interface Attachment {
    id?: number;
    ticket_id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    uploaded_at: string;
}