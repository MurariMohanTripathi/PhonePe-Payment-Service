# Payment Service

Centralized Node.js payment service for creating PhonePe checkout payments, checking payment status, receiving PhonePe webhooks, and storing payment records in PostgreSQL.

## What This Service Does

- Authenticates with PhonePe using client credentials.
- Creates a PhonePe checkout payment.
- Saves payment details in PostgreSQL.
- Checks latest payment status from PhonePe.
- Handles PhonePe webhook events and updates local payment status.
- Provides health and database test endpoints.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- PhonePe PG Checkout APIs
- Axios
- dotenv
- nodemon for development

## Project Structure

```txt
payment-service/
  src/
    app.js
    server.js
    config/
      database.js
      env.js
    controllers/
      payment.controller.js
      webhook.controller.js
    repositories/
      payment.repository.js
    routes/
      payment.routes.js
      webhook.routes.js
    services/
      phonepe.service.js
      webhook.service.js
  package.json
  .env.example
```

## Setup After Cloning

### 1. Install Node.js

Install Node.js on your system. This project uses CommonJS and should run on a modern Node.js version.

Check installation:

```bash
node -v
npm -v
```

### 2. Go To Project Folder

```bash
cd payment-service
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create `.env`

Create a `.env` file in the `payment-service` folder.

Example:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/payment_service

PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=your_client_version
PHONEPE_ENV=SANDBOX

PHONEPE_WEBHOOK_KEY_ID=your_webhook_key_id
PHONEPE_WEBHOOK_SECRET=your_webhook_secret
```

Current supported `PHONEPE_ENV` values:

- `SANDBOX`
- `PRODUCTION`

### 5. Create PostgreSQL Database

Create a database named `payment_service`, or use any database name and update `DATABASE_URL`.

Example SQL table:

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  merchant_order_id VARCHAR(100) UNIQUE NOT NULL,
  phonepe_order_id VARCHAR(100),
  amount NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  redirect_url TEXT,
  status VARCHAR(50) NOT NULL,
  provider VARCHAR(50) DEFAULT 'PHONEPE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Run The Server

For development:

```bash
npm run dev
```

For normal start:

```bash
npm start
```

Expected output:

```txt
Payment Service running on PORT 5000
Environment : SANDBOX
```

Base URL:

```txt
http://localhost:5000
```

## Endpoints

### Root Check

```http
GET /
```

Returns a simple message that the API is running.

### Health Check

```http
GET /health
```

Returns service health status and timestamp.

### Database Test

```http
GET /db-test
```

Checks if PostgreSQL is connected by running `SELECT NOW()`.

### PhonePe Auth Test

```http
GET /api/v1/phonepe/auth-test
```

Checks if the service can authenticate with PhonePe.

Success response:

```json
{
  "success": true,
  "message": "PhonePe authentication successfull"
}
```

### Create Payment

```http
POST /api/v1/phonepe/payments
Content-Type: application/json
```

Request body:

```json
{
  "amount": 1000,
  "redirectUrl": "http://localhost:3000/payment-success",
  "message": "Payment for order"
}
```

Important:

- `amount` must be an integer.
- `amount` is in paisa, so `1000` means Rs. 10.
- Minimum amount is `100`, which means Rs. 1.
- `redirectUrl` is required.

Success response:

```json
{
  "success": true,
  "message": "Payment Created Successfully",
  "payment": {
    "merchantOrderId": "PAY_1234567890_abcd1234",
    "phonePeOrderId": "PHONEPE_ORDER_ID",
    "amount": 1000,
    "currency": "INR",
    "status": "PENDING",
    "redirectUrl": "https://phonepe-checkout-url",
    "expireAt": 1234567890
  }
}
```

### Get Payment Status

```http
GET /api/v1/phonepe/payments/:merchantOrderId
```

Example:

```http
GET /api/v1/phonepe/payments/PAY_1234567890_abcd1234
```

This endpoint:

1. Finds the payment in local database.
2. Calls PhonePe status API.
3. Updates local payment status.
4. Returns normalized payment data.

### PhonePe Webhook

```http
POST /api/v1/webhooks/phonepe
Content-Type: application/json
```

This endpoint receives PhonePe webhook events.

Handled events:

- `checkout.order.completed`
- `checkout.order.failed`

Expected PhonePe headers:

```txt
x-phonepe-checksum-key-id
x-phonepe-checksum-signature
```

The webhook body is parsed as raw JSON because signature verification needs the original request body.

## Wireframe

```txt
Client App / Frontend
        |
        | 1. POST /api/v1/phonepe/payments
        v
+---------------------------+
|      Payment Service      |
|---------------------------|
| Controller                |
| Service                   |
| Repository                |
+---------------------------+
        |                 |
        | 2. Save payment | 3. Create checkout
        v                 v
+----------------+   +------------------+
|   PostgreSQL   |   |     PhonePe      |
|   payments     |   |  Checkout API    |
+----------------+   +------------------+
        ^                 |
        |                 | 4. Redirect URL
        +-----------------+
        |
        v
Client opens PhonePe checkout
```

## Payment Flow

```txt
1. Client sends create payment request
   POST /api/v1/phonepe/payments

2. Service validates request
   - amount must be integer
   - amount must be at least 100 paisa
   - redirectUrl is required

3. Service creates merchantOrderId
   Example: PAY_1234567890_abcd1234

4. Service stores payment locally with status CREATED

5. Service requests PhonePe checkout payment

6. PhonePe returns order details and redirect URL

7. Service updates local payment with PhonePe order ID and status

8. Client redirects user to PhonePe checkout URL

9. User completes or fails payment

10. PhonePe sends webhook to service
    POST /api/v1/webhooks/phonepe

11. Service verifies webhook signature

12. Service updates local payment status

13. Client can check latest status
    GET /api/v1/phonepe/payments/:merchantOrderId
```

## Status Check Flow

```txt
Client
  |
  | GET /api/v1/phonepe/payments/:merchantOrderId
  v
Payment Service
  |
  | Find payment in PostgreSQL
  v
PostgreSQL
  |
  | Payment found
  v
Payment Service
  |
  | Ask PhonePe for latest status
  v
PhonePe
  |
  | Return current state
  v
Payment Service
  |
  | Update local DB
  v
Client receives latest payment status
```

## Useful Commands

```bash
npm install
npm run dev
npm start
```

## Notes

- Do not commit `.env` because it contains secrets.
- Use `SANDBOX` while developing.
- Use `PRODUCTION` only with production PhonePe credentials.
- Keep webhook secrets private.
- Make sure PostgreSQL is running before starting the service.
- Make sure the webhook URL is publicly reachable when testing with PhonePe.

