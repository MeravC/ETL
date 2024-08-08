
# Client-Server-DB Project

This project implements a data ETL (Extract, Transform, Load) process using a client-server-database architecture.

## Description

The project consists of the following components:

1. **Client**: The client extracts data from a local file (`events.jsonl`) and sends it to the server using HTTP POST requests.
2. **Server**: The server receives the data from the client, saves it to a local file (`eventsPost.jsonl`), and provides an endpoint to retrieve data from the database.
3. **Data Processor**: The data processor reads the events from the local file (`eventsPost.jsonl`), calculates the revenue for each user, and updates the database accordingly.
4. **Database**: The project uses a Postgres database with a single table called `users_revenue` that stores the user's revenue.

## Getting Started

### Prerequisites

- Node.js
- Postgres database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MeravC/ETL.git
   ```

2. Install dependencies:

   ```bash
   cd ETL
   npm install
   ```

3. Set up the Postgres database:

   - Create a new database called `postgres`.
   - Run the SQL script `db.sql` to create the `users_revenue` table.
   - Update the database connection details in the `data_processor.js` and `server.js` files.

4. Start the server:

   ```bash
   node server.js
   ```

5. Start the data processor:

   ```bash
   node data_processor.js
   ```

6. Start the client:

   ```bash
   node client.js
   ```

The client will read the `events.jsonl` file and send the events to the server. The server will save the events to the `eventsPost.jsonl` file, and the data processor will read the events, calculate the revenue, and update the database.

You can access the user's revenue data by making a GET request to the `/userEvents/:userid` endpoint on the server.

## Assumptions and Considerations

1. The `events.jsonl` file is assumed to be in the correct format, with one event per line.
2. The `Authorization` header is used to authenticate the client's requests to the server. The secret value is hardcoded as `'secret'`.
3. The data processor handles the case where multiple processes are updating the same user's revenue in the database by using a `BEGIN`/`COMMIT` block with a `FOR UPDATE` clause to lock the row before updating it.
4. The data processor can handle large event files by processing the events in memory and updating the database in batches.

## Future Improvements

1. Implement more robust error handling and logging.
2. Add support for more event types and data fields.
3. Implement a more secure authentication mechanism, such as using JSON Web Tokens (JWT).
4. Optimize the data processor's performance by using a more efficient database update strategy, such as a batch update.
5. Add unit tests for the individual components.