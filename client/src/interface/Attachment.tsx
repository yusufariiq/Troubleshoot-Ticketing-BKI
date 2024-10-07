export default interface Attachment {
    id?: number;
    ticket_id: number;
    file_name: string;
    file_data: string;
    file_type: string;
    uploaded_at: string;
}