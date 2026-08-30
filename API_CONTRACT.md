# API_CONTRACT.md

Permanent single source of truth for all API contracts between the Frontend and Backend services in the **Self-Print** platform.

---

## AI Development Instructions

Before making any code changes or proposing new features, every AI agent must:

1. **Read `MEMORY.md`** - Understand project state, completed work, and context.
2. **Read `ARCHITECTURE.md`** - Adhere strictly to the established system design and patterns.
3. **Read `RULES.md`** - Follow all coding standards, constraints, and practices.
4. **Read `API_CONTRACT.md`** - Ensure API endpoints, types, payloads, and responses match the contract.

> Every new endpoint must be documented here **before implementation**. Never change request or response formats without updating this document.

---

## Global Standards

- **Base URL:** `http://localhost:5000/api/v1` (Development) / `/api/v1` (Production)
- **Content-Type:** `application/json` (unless handling file uploads with `multipart/form-data`)
- **Character Encoding:** `UTF-8`

### Standard Success Response Envelope

```json
{
  "success": true,
  "message": "Human readable status message",
  "data": { ... },
  "timestamp": "2026-08-24T00:00:00.000Z"
}
```

### Standard Error Response Envelope

```json
{
  "success": false,
  "message": "Human readable error description",
  "error": "Detailed error message or error code",
  "timestamp": "2026-08-24T00:00:00.000Z"
}
```

### Standard HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| `200` | OK | Successful GET, PUT, PATCH, or general operation |
| `201` | Created | Successful resource creation via POST |
| `400` | Bad Request | Validation errors, missing parameters, malformed JSON |
| `401` | Unauthorized | Missing, invalid, or expired authentication token |
| `403` | Forbidden | Authenticated user lacks required permissions / roles |
| `404` | Not Found | Target resource or route does not exist |
| `422` | Unprocessable Entity | Semantically invalid data / business rule violation |
| `500` | Internal Server Error | Unhandled server exceptions or third-party service failures |

---

## Implemented Endpoints

### 1. Root System Status

- **Endpoint:** `GET /`
- **Description:** Checks if backend server is online and operational.
- **Authentication:** None (Public)
- **Request Body:** None
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Self-Print Backend API operational",
    "data": {
      "environment": "development",
      "version": "0.1.0"
    },
    "timestamp": "2026-08-24T00:00:00.000Z"
  }
  ```

---

### 2. Service Health Check

- **Endpoint:** `GET /api/v1/health`
- **Description:** Returns API health status, uptime, and server timestamp for monitoring.
- **Authentication:** None (Public)
- **Request Body:** None
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Self-Print API is healthy and running",
    "data": {
      "status": "UP",
      "uptime": 142.35,
      "timestamp": "2026-08-24T00:00:00.000Z"
    },
    "timestamp": "2026-08-24T00:00:00.000Z"
  }
  ```

---

## Planned Endpoints (Contract Drafts for Upcoming Features)

### 3. Upload Document

- **Endpoint:** `POST /api/v1/files/upload`
- **Description:** Upload a document (PDF, DOCX, PNG, JPEG) to be queued for printing.
- **Authentication:** Optional / Session Token
- **Headers:** `Content-Type: multipart/form-data`
- **Request Body (FormData):**
  - `file`: File binary (Max size: 50MB)
- **Validation Rules:**
  - Allowed MIME types: `application/pdf`, `image/png`, `image/jpeg`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "File uploaded and processed successfully",
    "data": {
      "fileId": "uuid-v4-string",
      "originalName": "assignment.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 2048576,
      "pageCount": 5,
      "previewUrl": "/api/v1/files/uuid-v4-string/preview"
    },
    "timestamp": "2026-08-24T00:00:00.000Z"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: "Unsupported file type" or "File size exceeds 50MB"

---

### 4. Create Print Job

- **Endpoint:** `POST /api/v1/print-jobs`
- **Description:** Submits a print configuration for an uploaded document.
- **Authentication:** Optional / Session Token
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "fileId": "uuid-v4-string",
    "stationId": "uuid-or-station-code",
    "options": {
      "copies": 1,
      "colorMode": "BW", // "BW" | "COLOR"
      "pageRange": "all", // "all" | "1-3" | "1,3,5"
      "duplex": "SIMPLEX", // "SIMPLEX" | "DUPLEX_LONG" | "DUPLEX_SHORT"
      "paperSize": "A4" // "A4" | "A3" | "LETTER"
    }
  }
  ```
- **Validation Rules:**
  - `fileId`: Required, valid UUID
  - `copies`: Integer >= 1, <= 100
  - `colorMode`: Must be one of `["BW", "COLOR"]`
  - `pageRange`: Valid page format string
  - `duplex`: Must be one of `["SIMPLEX", "DUPLEX_LONG", "DUPLEX_SHORT"]`
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Print job created successfully",
    "data": {
      "jobId": "job-uuid-v4",
      "fileId": "uuid-v4-string",
      "status": "DRAFT",
      "totalCost": 15.00,
      "currency": "INR",
      "totalPages": 5,
      "estimatedPrintTimeSeconds": 25
    },
    "timestamp": "2026-08-24T00:00:00.000Z"
  }
  ```

---

### 5. Get Print Job Status

- **Endpoint:** `GET /api/v1/print-jobs/:id`
- **Description:** Fetch the real-time status and telemetry of a print job.
- **Authentication:** Public with Job ID / Session Scoped
- **Path Parameters:**
  - `id`: Job UUID
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Print job details retrieved",
    "data": {
      "jobId": "job-uuid-v4",
      "status": "PRINTING", // "DRAFT" | "PENDING_PAYMENT" | "QUEUED" | "PROCESSING" | "PRINTING" | "COMPLETED" | "FAILED" | "CANCELLED"
      "pagesPrinted": 3,
      "totalPages": 5,
      "station": {
        "name": "Library Main Hall Station 1",
        "code": "STN-LIB-01"
      },
      "createdAt": "2026-08-24T00:00:00.000Z",
      "updatedAt": "2026-08-24T00:01:15.000Z"
    },
    "timestamp": "2026-08-24T00:01:15.000Z"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: "Print job not found"

---

### 6. Get Store Live Print Queue

- **Endpoint:** `GET /api/v1/stores/:storeId/queue`
- **Description:** Fetches all print jobs in a store's active live queue with optional search, status tab, paper size, and sort query parameters.
- **Authentication:** Store Operator / Bearer Token
- **Query Parameters:**
  - `status`: Optional (`Waiting` | `Printing` | `Completed` | `Cancelled` | `Failed`)
  - `search`: Optional string (jobCode, fileName, customerName, phone)
  - `paperSize`: Optional (`A4` | `A3` | `Letter` | `Legal`)
  - `colorMode`: Optional (`B&W` | `Color`)
  - `sortBy`: Optional (`newest` | `oldest` | `highest_pages` | `lowest_pages` | `price_high` | `price_low`)
  - `page`: Optional integer (default `1`)
  - `limit`: Optional integer (default `6`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store print queue retrieved successfully",
    "data": {
      "jobs": [
        {
          "id": "job-102",
          "jobCode": "#102",
          "fullJobId": "SP-20250812-102",
          "customerName": "Guest",
          "customerPhone": "+91 98765 43210",
          "fileName": "notes.pdf",
          "fileSize": "1.2 MB",
          "fileType": "pdf",
          "pages": 12,
          "copies": 1,
          "colorMode": "B&W",
          "paperSize": "A4",
          "estimatedPrice": 24.0,
          "uploadTime": "10:24 AM",
          "timeAgo": "2 mins ago",
          "estimatedFinishTime": "10:26 AM",
          "status": "Printing",
          "paymentStatus": "Paid",
          "currentPrintingPage": 1,
          "progressPercent": 8
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 6,
        "total": 6,
        "totalPages": 1
      },
      "summary": {
        "printingNow": 1,
        "waitingInQueue": 2,
        "completedToday": 45,
        "failedToday": 1,
        "cancelledToday": 1,
        "totalRevenueToday": 720.0
      }
    },
    "timestamp": "2026-08-29T12:00:00.000Z"
  }
  ```

---

### 7. Update Print Job Status in Queue

- **Endpoint:** `PATCH /api/v1/stores/:storeId/queue/:jobId/status`
- **Description:** Updates the status of an existing queue item (e.g. from `Waiting` to `Printing`, or `Printing` to `Completed`, or `Failed` to `Waiting` for retry).
- **Authentication:** Store Operator / Bearer Token
- **Request Body:**
  ```json
  {
    "status": "Printing" // "Waiting" | "Printing" | "Completed" | "Cancelled" | "Failed"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Job status updated to Printing",
    "data": {
      "jobId": "job-102",
      "status": "Printing",
      "updatedAt": "2026-08-29T12:05:00.000Z"
    },
    "timestamp": "2026-08-29T12:05:00.000Z"
  }
  ```

---

### 8. Clear Completed Queue Jobs

- **Endpoint:** `POST /api/v1/stores/:storeId/queue/clear-completed`
- **Description:** Removes all `Completed` jobs from the active store queue backlog.
- **Authentication:** Store Operator / Bearer Token
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Cleared 45 completed jobs from active queue",
    "data": {
      "clearedCount": 45
    },
    "timestamp": "2026-08-29T12:10:00.000Z"
  }
  ```

---

### 9. Get Store Transaction History

- **Endpoint:** `GET /api/v1/stores/:storeId/transactions`
- **Description:** Returns paginated financial transaction records with search and filter criteria.
- **Authentication:** Store Operator / Bearer Token
- **Query Parameters:**
  - `search`: Customer name, phone, transaction ID, job ID
  - `dateRange`: `today` | `yesterday` | `last_7_days` | `last_30_days` | `this_month` | `custom`
  - `paymentStatus`: `All` | `Completed` | `Pending` | `Refunded` | `Failed`
  - `paymentMethod`: `All` | `UPI` | `Cash` | `Card` | `Wallet`
  - `colorMode`: `All` | `B&W` | `Color`
  - `paperSize`: `All` | `A4` | `A3` | `Letter` | `Legal`
  - `sortBy`: `newest` | `oldest` | `amount_high` | `amount_low` | `pages_high` | `pages_low`
  - `page`: Page index (default `1`)
  - `limit`: Items per page (default `8`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Transactions retrieved successfully",
    "data": {
      "transactions": [
        {
          "id": "txn-10048",
          "transactionId": "TXN-10048",
          "jobId": "SP-20240524-102",
          "customerName": "Rahul Sharma",
          "customerPhone": "9876543210",
          "pages": 12,
          "copies": 1,
          "paperSize": "A4",
          "colorMode": "B&W",
          "pricePerPage": 1.0,
          "subtotal": 12.0,
          "tax": 0.0,
          "discount": 0.0,
          "amount": 12.0,
          "paymentMethod": "UPI (GPay)",
          "upiReference": "UPI/CR/489201938/GPay",
          "paymentStatus": "Completed",
          "printStatus": "Completed",
          "transactionDate": "24 May 2024",
          "transactionTime": "10:24 AM"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 8,
        "total": 48,
        "totalPages": 6
      },
      "summary": {
        "totalTransactions": 48,
        "totalRevenue": 720.0,
        "cashReceived": 720.0,
        "avgOrderValue": 15.0,
        "refundsTotal": 0.0
      }
    },
    "timestamp": "2026-08-29T12:00:00.000Z"
  }
  ```

---

### 10. Get Store Revenue Analytics

- **Endpoint:** `GET /api/v1/stores/:storeId/transactions/analytics`
- **Description:** Returns daily revenue timeline and payment method breakdown for chart visualizations.
- **Authentication:** Store Operator / Bearer Token
- **Query Parameters:**
  - `period`: `last_7_days` | `last_30_days` | `this_month`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Revenue analytics retrieved",
    "data": {
      "timeline": [
        { "date": "18 May", "fullDate": "18 May 2024", "revenue": 210, "transactionsCount": 18 },
        { "date": "19 May", "fullDate": "19 May 2024", "revenue": 380, "transactionsCount": 26 },
        { "date": "20 May", "fullDate": "20 May 2024", "revenue": 310, "transactionsCount": 22 },
        { "date": "21 May", "fullDate": "21 May 2024", "revenue": 490, "transactionsCount": 34 },
        { "date": "22 May", "fullDate": "22 May 2024", "revenue": 400, "transactionsCount": 28 },
        { "date": "23 May", "fullDate": "23 May 2024", "revenue": 720, "transactionsCount": 48 },
        { "date": "24 May", "fullDate": "24 May 2024", "revenue": 610, "transactionsCount": 42 }
      ],
      "breakdown": [
        { "method": "UPI", "amount": 540.0, "percentage": 75, "count": 36, "color": "#4F46E5" },
        { "method": "Cash", "amount": 180.0, "percentage": 25, "count": 12, "color": "#10B981" }
      ],
      "totalRevenue": 720.0
    },
    "timestamp": "2026-08-29T12:00:00.000Z"
  }
  ```

---

### 11. Get Complete Store Settings

- **Endpoint:** `GET /api/v1/stores/:storeId/settings`
- **Description:** Returns all configuration profiles (general, printer, pricing, payment, preferences, notifications).
- **Authentication:** Store Operator / Bearer Token
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store settings retrieved",
    "data": {
      "general": {
        "storeName": "Demo Print Store",
        "branchName": "Main Branch",
        "storeOwnerName": "Subham Das",
        "storePhone": "9876543210",
        "storeEmail": "contact@demoprintstore.com",
        "storeLocation": "Koramangala, Bengaluru, Karnataka 560034",
        "storeAddress": "Shop No. 12, 1st Floor, 8th Main, Koramangala 4th Block, Bengaluru, Karnataka 560034",
        "openingTime": "08:00 AM",
        "closingTime": "10:00 PM",
        "timezone": "Asia/Kolkata (IST)"
      },
      "printer": {
        "selectedPrinter": "HP LaserJet 1020",
        "defaultPaperSize": "A4",
        "defaultPrintType": "Black & White",
        "autoStartAfterPayment": true,
        "doubleSidedDefault": false,
        "paperSaveMode": false
      },
      "pricing": {
        "bwA4Price": 2.0,
        "bwA3Price": 4.0,
        "colorA4Price": 6.0,
        "colorA3Price": 12.0,
        "extraCopyA4Price": 1.0,
        "extraCopyA3Price": 2.0
      },
      "payment": {
        "upiId": "demoprintstore@okhdfcbank",
        "merchantName": "Demo Print Store",
        "paymentGateway": "Direct UPI",
        "autoPaymentVerification": true,
        "cashAccepted": true
      },
      "preferences": {
        "autoRefreshInterval": "10 Seconds",
        "theme": "Light",
        "language": "English",
        "showLowStockAlerts": true,
        "showRevenueOnDashboard": true
      }
    },
    "timestamp": "2026-08-29T12:00:00.000Z"
  }
  ```

---

### 12. Update Store Settings

- **Endpoint:** `PUT /api/v1/stores/:storeId/settings`
- **Description:** Updates the full store settings configuration.
- **Authentication:** Store Operator / Bearer Token
- **Request Body:** Partial or complete settings object
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store settings updated successfully",
    "timestamp": "2026-08-29T12:00:00.000Z"
  }
  ```

---

### 13. Update Store Pricing Matrix

- **Endpoint:** `PATCH /api/v1/stores/:storeId/settings/pricing`
- **Description:** Granular endpoint to update per-page print pricing matrix.
- **Authentication:** Store Operator / Bearer Token
- **Request Body:**
  ```json
  {
    "bwA4Price": 2.0,
    "bwA3Price": 4.0,
    "colorA4Price": 6.0,
    "colorA3Price": 12.0,
    "extraCopyA4Price": 1.0,
    "extraCopyA3Price": 2.0
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store pricing updated successfully",
    "timestamp": "2026-08-29T12:00:00.000Z"
  }
  ```

---

### 14. Customer Kiosk Store Telemetry

- **Endpoint:** `GET /api/v1/kiosk/:storeId/info`
- **Description:** Public lightweight endpoint scanned by QR code to load store pricing, online status, and UPI payment routing without authentication.
- **Authentication:** None (Public)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "storeId": "SP10239",
      "storeName": "PrintHub Store",
      "branchName": "Main Branch",
      "isPrinterOnline": true,
      "bwA4Price": 2.0,
      "bwA3Price": 4.0,
      "colorA4Price": 10.0,
      "colorA3Price": 15.0,
      "serviceCharge": 0.0,
      "upiId": "printhub@upi"
    },
    "timestamp": "2026-08-29T12:00:00.000Z"
  }
  ```

---

### 15. Customer Kiosk Direct File Upload & Parse

- **Endpoint:** `POST /api/v1/kiosk/:storeId/upload`
- **Description:** Receives customer document, calculates exact page count, and extracts color vs monochrome pages without permanent retention.
- **Authentication:** None (Public)
- **Content-Type:** `multipart/form-data`
- **Request Body:** `file` (Binary)
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "File parsed successfully",
    "data": {
      "fileId": "file-notes-12",
      "fileName": "Notes.pdf",
      "fileSize": 1258291,
      "formattedSize": "1.2 MB",
      "totalPages": 12,
      "mimeType": "application/pdf"
    },
    "timestamp": "2026-08-29T12:00:00.000Z"
  }
  ```

---

### 16. Customer Create Print Order & Kiosk Dispatch

- **Endpoint:** `POST /api/v1/kiosk/:storeId/orders`
- **Description:** Submits customer print configuration, verifies UPI transaction reference, and pushes job directly to store printer queue.
- **Authentication:** None (Session-bound kiosk token)
- **Request Body:**
  ```json
  {
    "fileId": "file-notes-12",
    "copies": 1,
    "colorMode": "Black & White",
    "paperSize": "A4",
    "pageSelection": "All",
    "totalAmount": 24.0,
    "paymentMethod": "UPI",
    "upiReference": "UPI/CR/489201938/GPay"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Print job created and queued",
    "data": {
      "jobId": "SP-10239-082",
      "status": "Waiting",
      "queuePosition": 1,
      "createdAt": "2026-08-29T12:05:00.000Z"
    },
    "timestamp": "2026-08-29T12:05:00.000Z"
  }
  ```

---

### 17. Real-Time Kiosk Job Spooler Stream / Polling

- **Endpoint:** `GET /api/v1/kiosk/orders/:jobId/stream`
- **Description:** Server-Sent Events (SSE) stream or polling fallback providing real-time hardware page output increments and completion notifications.
- **Authentication:** None (Job-bound session token)
- **SSE Event Payloads:**
  - `event: progress`
    ```json
    {
      "jobId": "SP-10239-082",
      "currentPage": 3,
      "totalPages": 18,
      "currentCopy": 1,
      "totalCopies": 2,
      "percent": 16,
      "secondsRemaining": 14,
      "status": "Printing"
    }
    ```
  - `event: completed`
    ```json
    {
      "jobId": "SP-10239-082",
      "status": "Completed",
      "completedAt": "2026-08-29T12:06:18.000Z",
### 18. Store Partner Onboarding Registration

- **Endpoint:** `POST /api/v1/store/register` (or `/api/store/register`)
- **Description:** Registers a new print store partner with business metadata, owner credentials, and bank payout details.
- **Authentication:** None (Public partner onboarding)
- **Request Payload (`application/json`):**
  ```json
  {
    "storeDetails": {
      "storeName": "Print Hub Xerox & Cyber Cafe",
      "ownerName": "Diganta Borah",
      "storeAddress": "Shop No. 4, Opposite Cotton University, Panbazar",
      "country": "India",
      "state": "Assam",
      "city": "Guwahati",
      "pinCode": "781001",
      "phone": "9864012345",
      "alternatePhone": "9864098765",
      "email": "printhub.guwahati@gmail.com",
      "gstNumber": "18AABCU9603R1ZM",
      "storeImage": "data:image/jpeg;base64,...",
      "password": "Password@123"
    },
    "bankDetails": {
      "accountHolderName": "Diganta Borah",
      "bankName": "State Bank of India",
      "accountNumber": "302948192834",
      "ifscCode": "SBIN0000088",
      "branchName": "Panbazar Branch, Guwahati",
      "upiId": "printhub@sbi"
    },
    "confirmed": true
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Store partner registered successfully",
    "data": {
      "storeId": "STR-2025-089",
      "storeName": "Print Hub Xerox & Cyber Cafe",
      "qrToken": "qr_live_9812401",
      "storeToken": "tok_store_STR-2025-089_1740000000"
    },
    "timestamp": "2026-08-30T10:45:00.000Z"
  }
  ```

---

### 19. Store Partner Login

- **Endpoint:** `POST /api/v1/store/login` (or `/api/store/login`)
- **Description:** Authenticates a registered store partner using email and password credentials.
- **Authentication:** None (Public login)
- **Request Payload (`application/json`):**
  ```json
  {
    "email": "printhub.guwahati@gmail.com",
    "password": "Password@123"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store authenticated successfully",
    "data": {
      "token": "tok_store_STR-7810_1740000000",
      "store": {
        "storeId": "STR-7810",
        "storeName": "Print Hub Xerox & Cyber Cafe",
        "ownerName": "Diganta Borah",
        "email": "printhub.guwahati@gmail.com",
        "phone": "9864012345",
        "address": "Shop No. 4, Opposite Cotton University, Panbazar, Guwahati",
        "city": "Guwahati",
        "state": "Assam"
      }
    },
    "timestamp": "2026-08-30T10:50:00.000Z"
  }
  ```
- **Error Response (`401 Unauthorized`):**
  ```json
  {
    "success": false,
    "message": "The email or password you entered is incorrect. Please try again.",
    "error": "INVALID_CREDENTIALS",
    "timestamp": "2026-08-30T10:50:00.000Z"
  }
  ```

---

### 20. Printer Hardware Detection & Setup APIs

#### 20.1 Detect Connected Printers
- **Endpoint:** `GET /api/v1/printer/detect`
- **Description:** Scans local OS USB ports, Windows Print Spooler, CUPS, and local Wi-Fi/LAN subnets for compatible printing devices.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "printers": [
        {
          "id": "prn-hp-1020",
          "name": "HP LaserJet 1020 Plus",
          "brand": "HP",
          "model": "LaserJet 1020 Plus Series",
          "type": "LaserJet",
          "connection": "USB",
          "port": "USB001",
          "isColor": false,
          "isDuplexSupported": false,
          "paperLevel": 88,
          "inkLevels": { "black": 82 },
          "status": "Online"
        }
      ]
    }
  }
  ```

#### 20.2 Connect & Configure Printer
- **Endpoint:** `POST /api/v1/printer/connect`
- **Request Payload:**
  ```json
  {
    "printerId": "prn-hp-1020",
    "config": {
      "defaultPaper": "A4",
      "defaultQuality": "Standard",
      "defaultColorMode": "Black & White",
      "duplex": false,
      "autoCut": false,
      "autoSpool": true
    }
  }
  ```

#### 20.3 Test Print Page Spooler
- **Endpoint:** `POST /api/v1/printer/test`
- **Request Payload:** `{ "printerId": "prn-hp-1020" }`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Diagnostic test sheet spooled successfully",
    "data": { "jobId": "TST-PAGE-9812" }
  }
  ```

#### 20.4 Live Telemetry & Health Status
- **Endpoint:** `GET /api/v1/printer/status`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "printerId": "prn-hp-1020",
      "status": "Online",
      "paperLevel": 88,
      "inkLevels": { "black": 82 },
      "spoolerQueueCount": 0
    }
  }
  ```

#### 20.5 Restart Spooler
- **Endpoint:** `POST /api/v1/printer/restart`
- **Request Payload:** `{ "printerId": "prn-hp-1020" }`
- **Success Response (`200 OK`):** `{ "success": true, "message": "Spooler restarted" }`







