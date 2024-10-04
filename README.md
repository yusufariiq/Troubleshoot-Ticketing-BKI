# Ticketing System Backend

This is the backend service for the BKI Troubleshooting Ticketing System. It provides REST APIs for managing support tickets.

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── ticketController.js
│   ├── models/
│   │   └── Ticket.js
│   ├── repositories/
│   │   └── ticketRepository.js
│   ├── routes/
│   │   └── ticketRoutes.js
│   ├── services/
│   │   └── ticketService.js
│   ├── server.js
│   └── .env
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

## Database Schema

The system uses a PostgreSQL database with the following schema for tickets:

```sql
CREATE TABLE ticket_troubleshoot (
    ticket_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50),
    status VARCHAR(50),
    reporter VARCHAR(100),
    assignee VARCHAR(100),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(100),
    attachment_id INTEGER
);
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5432
PG_DB_NAME=bki
PG_PASSWORD=1234
PG_USER=postgres
PG_HOST=localhost
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the database and table using the schema provided above
4. Set up your environment variables in `.env`

## Running the Server

To start the server:

```bash
node src/server.js
```

## API Endpoints

### Tickets

- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get a specific ticket
- `POST /api/tickets` - Create a new ticket
- `PUT /api/tickets/:id` - Update an existing ticket
- `DELETE /api/tickets/:id` - Delete a ticket

### Request Body Example (POST/PUT)

```json
{
  "title": "Network Connection Issue",
  "description": "Unable to connect to internal network",
  "priority": "High",
  "status": "Open",
  "reporter": "John Doe",
  "assignee": "Jane Smith",
  "category": "Network"
}
```

## Dependencies

- express - Web framework
- pg - PostgreSQL client
- dotenv - Environment variable management
- cors - Cross-Origin Resource Sharing
- multer - File upload handling

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your chosen license]
