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

### Standard Validation Error Response Envelope (HTTP 422)

```json
{
  "success": false,
  "message": "Validation Failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": {
    "storeName": "Store name is required",
    "phone": "Phone number must contain 10 digits",
    "email": "Email already exists",
    "gstin": "Invalid GSTIN format",
    "ifscCode": "Invalid IFSC code",
    "accountNumber": "Account number is invalid"
  },
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

---

### 21. Store Dashboard Backend APIs

#### 21.1 Full Dashboard Overview
- **Endpoint:** `GET /api/v1/store/dashboard`
- **Description:** Aggregates top KPIs (Today's Jobs, Revenue, Printing Now, Waiting Queue), active printer status, store profile, stock alerts, activity feed, today's summary chart, and unread notification count.
- **Authentication:** Public / Store Operator
- **Query Parameters:**
  - `storeId`: Optional string (Store ID or Store Code, e.g. `SP-1001`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store dashboard data retrieved successfully",
    "data": {
      "store": {
        "id": "66d123456789abcdef012345",
        "name": "Demo Print Store",
        "location": "Shop No. 12, Koramangala 4th Block, Bengaluru, Karnataka 560034",
        "storeCode": "SP-1001",
        "ownerName": "Subham Das",
        "isOnline": true,
        "isPaused": false
      },
      "printer": {
        "id": "66d123456789abcdef012346",
        "name": "HP LaserJet 1020",
        "model": "HP HP LaserJet 1020 Plus Monochromatic",
        "isOnline": true,
        "connectionStatus": "Connected",
        "printerStatus": "Ready",
        "paperSize": "A4",
        "tonerPercentage": 72,
        "paperPercentage": 85,
        "ipAddress": "192.168.1.145"
      },
      "stats": [
        {
          "id": "jobs",
          "title": "Today's Jobs",
          "value": 48,
          "trend": { "value": "12%", "isPositive": true, "period": "vs yesterday" },
          "variant": "purple"
        },
        {
          "id": "revenue",
          "title": "Today's Revenue",
          "value": "₹720.00",
          "trend": { "value": "8%", "isPositive": true, "period": "vs yesterday" },
          "variant": "green"
        },
        {
          "id": "printing",
          "title": "Printing Now",
          "value": 1,
          "actionLabel": "View in Queue",
          "actionTab": "Printing",
          "variant": "blue"
        },
        {
          "id": "waiting",
          "title": "Waiting in Queue",
          "value": 2,
          "actionLabel": "View in Queue",
          "actionTab": "Waiting",
          "variant": "amber"
        }
      ],
      "recentQueue": [
        {
          "id": "66d123456789abcdef012347",
          "jobCode": "#102",
          "fileName": "notes.pdf",
          "fileType": "pdf",
          "fileSize": "2.4 MB",
          "customer": "Guest",
          "pages": 12,
          "copies": 1,
          "colorMode": "B&W",
          "status": "Printing",
          "time": "10:24 AM",
          "timeAgo": "2 mins ago",
          "cost": 24.0
        }
      ],
      "activities": [
        {
          "id": "act-1",
          "jobCode": "Job #101",
          "action": "completed",
          "fileName": "book.pdf",
          "time": "10:20 AM",
          "type": "success"
        }
      ],
      "stockAlerts": [
        {
          "id": "stock-1",
          "itemName": "A4 Paper",
          "details": "Only 32 sheets left",
          "severity": "Low",
          "type": "paper"
        }
      ],
      "summary": {
        "totalJobs": 48,
        "completed": 45,
        "completedPercent": 75,
        "printing": 1,
        "printingPercent": 2,
        "waiting": 2,
        "waitingPercent": 3,
        "failed": 1,
        "failedPercent": 2,
        "totalRevenue": "₹720.00"
      },
      "notificationsCount": 3,
      "lastUpdated": "2026-08-30T11:25:00.000Z"
    }
  }
  ```

#### 21.2 Recent Queue Table
- **Endpoint:** `GET /api/v1/store/dashboard/queue`
- **Description:** Returns paginated recent queue jobs filtered by status tab (`All`, `Printing`, `Waiting`, `Completed`, `Failed`).
- **Query Parameters:**
  - `storeId`: Optional string
  - `status`: Optional (`All` | `Printing` | `Waiting` | `Completed` | `Failed` | `Cancelled`)
  - `page`: Optional integer (default `1`)
  - `limit`: Optional integer (default `10`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Queue jobs retrieved successfully",
    "data": {
      "jobs": [ ... ],
      "total": 8,
      "pagination": { "page": 1, "limit": 10, "total": 8, "totalPages": 1 }
    }
  }
  ```

#### 21.3 Today's Activity Feed
- **Endpoint:** `GET /api/v1/store/dashboard/activity`
- **Query Parameters:** `storeId`, `limit` (default: 10)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Today's activities retrieved successfully",
    "data": [
      {
        "id": "act-1",
        "jobCode": "Job #101",
        "action": "completed",
        "fileName": "book.pdf",
        "time": "10:20 AM",
        "type": "success"
      }
    ]
  }
  ```

#### 21.4 Stock Supply Alerts
- **Endpoint:** `GET /api/v1/store/dashboard/stock-alerts`
- **Query Parameters:** `storeId`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Stock alerts retrieved successfully",
    "data": [
      { "id": "stock-1", "itemName": "A4 Paper", "details": "Only 32 sheets left", "severity": "Low", "type": "paper" },
      { "id": "stock-2", "itemName": "Toner Cartridge", "details": "20% remaining", "severity": "Low", "type": "toner" },
      { "id": "stock-3", "itemName": "Color Ink", "details": "15% remaining", "severity": "Critical", "type": "ink" }
    ]
  }
  ```

#### 21.5 Today's Summary Breakdown
- **Endpoint:** `GET /api/v1/store/dashboard/summary`
- **Query Parameters:** `storeId`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Today's summary breakdown retrieved successfully",
    "data": {
      "totalJobs": 48,
      "completed": 45,
      "completedPercent": 75,
      "printing": 1,
      "printingPercent": 2,
      "waiting": 2,
      "waitingPercent": 3,
      "failed": 1,
      "failedPercent": 2,
      "totalRevenue": "₹720.00"
    }
  }
  ```

#### 21.6 Notifications List & Unread Count
- **Endpoint:** `GET /api/v1/store/dashboard/notifications`
- **Query Parameters:** `storeId`, `limit` (default: 10)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Notifications retrieved successfully",
    "data": {
      "unreadCount": 3,
      "notifications": [
        {
          "id": "notif-1",
          "title": "Job #102 started printing",
          "desc": "notes.pdf (12 pages, B&W)",
          "time": "2 mins ago",
          "type": "info",
          "isRead": false
        }
      ]
    }
  }
  ```

---

### 22. Admin Users Management Backend APIs

#### 22.1 List Paginated & Filtered Users
- **Endpoint:** `GET /api/v1/admin/users`
- **Description:** Returns paginated, searchable, and multi-filtered user records.
- **Query Parameters:**
  - `searchQuery`: Optional string (searches name, email, phone, city, user code)
  - `status`: Optional (`Active` | `Inactive` | `Blocked` | `Banned` | `Pending` | `Verified`)
  - `store`: Optional store name
  - `city`: Optional city string
  - `plan`: Optional (`Basic` | `Pro` | `Enterprise` | `Student`)
  - `sortBy`: Optional (`newest` | `oldest` | `orders` | `spent` | `active` | `name`)
  - `page`: Optional integer (default `1`)
  - `pageSize`: Optional integer (default `10`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": {
      "users": [
        {
          "id": "66d123456789abcdef012399",
          "userIdCode": "USR-1001",
          "name": "Rahul Das",
          "email": "rahul.das@gmail.com",
          "phone": "+91 99540 60000",
          "avatarUrl": "https://images.unsplash.com/...",
          "storeId": "66d123456789abcdef012345",
          "storeName": "Print Hub Dibrugarh",
          "city": "Dibrugarh",
          "state": "Assam",
          "fullAddress": "AMC Road, Near Thana Chariali, Dibrugarh",
          "country": "India",
          "totalOrders": 28,
          "totalSpentRaw": 2450,
          "totalSpentFormatted": "₹2,450.00",
          "pagesPrinted": 184,
          "colorPrintsCount": 42,
          "bwPrintsCount": 142,
          "favoriteStore": "Print Hub Dibrugarh",
          "status": "Active",
          "isVerified": true,
          "membershipPlan": "Pro",
          "joinedOn": "22 Apr 2025",
          "lastActive": "2 mins ago",
          "isOnline": true
        }
      ],
      "totalCount": 1248,
      "totalPages": 125,
      "currentPage": 1,
      "pageSize": 10,
      "uniqueStores": ["Copy Center Jorhat", "Print Hub Dibrugarh", "Print Zone Guwahati"],
      "uniqueCities": ["Dibrugarh", "Guwahati", "Jorhat", "Silchar", "Tezpur"]
    }
  }
  ```

#### 22.2 User KPI Statistics
- **Endpoint:** `GET /api/v1/admin/users/stats`
- **Description:** Aggregates live user stats across the platform.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "User statistics retrieved successfully",
    "data": {
      "totalUsers": 1248,
      "totalUsersTrend": "↑ 15.3% from last month",
      "activeUsers": 896,
      "activeUsersTrend": "↑ 18.7% from last month",
      "newUsersToday": 48,
      "newUsersTrend": "↑ 12.5% from yesterday",
      "verifiedUsers": 1102,
      "verifiedPercent": "88.3% of total users",
      "bannedUsers": 14,
      "bannedUsersTrend": "↓ 6.7% from last month",
      "usersOnline": 124,
      "onlineSubtitle": "Live right now"
    }
  }
  ```

#### 22.3 User Detailed Profile with Order History
- **Endpoint:** `GET /api/v1/admin/users/:id`
- **Query/Path Parameters:** `id` (MongoDB ObjectId or `userIdCode`, e.g. `USR-1001`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "User details retrieved successfully",
    "data": {
      "id": "66d123456789abcdef012399",
      "userIdCode": "USR-1001",
      "name": "Rahul Das",
      "email": "rahul.das@gmail.com",
      "phone": "+91 99540 60000",
      "totalSpentFormatted": "₹2,450.00",
      "totalOrders": 28,
      "pagesPrinted": 184,
      "membershipPlan": "Pro",
      "status": "Active",
      "recentOrders": [
        {
          "id": "66d123456789abcdef012388",
          "jobNumber": "#101",
          "fileName": "Final_Resume_2025.pdf",
          "storeName": "Print Hub Dibrugarh",
          "pages": 3,
          "colorMode": "Color",
          "amount": "₹30.00",
          "status": "Completed",
          "date": "29 May 2025"
        }
      ]
    }
  }
  ```

#### 22.4 Update User Details
- **Endpoint:** `PUT /api/v1/admin/users/:id`
- **Request Payload:**
  ```json
  {
    "name": "Rahul Das",
    "phone": "+91 99540 60000",
    "email": "rahul.das@gmail.com",
    "address": "AMC Road, Near Thana Chariali",
    "city": "Dibrugarh",
    "membershipPlan": "Pro",
    "status": "Active"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "data": { ... }
  }
  ```

#### 22.5 Update / Toggle User Status
- **Endpoint:** `PATCH /api/v1/admin/users/:id/status`
- **Request Payload:**
  ```json
  {
    "status": "Banned",
    "reason": "Suspected fraudulent transaction attempts"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "User status updated successfully",
    "data": { ... }
  }
  ```

#### 22.6 Soft Delete User
- **Endpoint:** `DELETE /api/v1/admin/users/:id`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "User successfully soft-deleted from platform",
    "data": { "success": true, "message": "User successfully soft-deleted from platform" }
  }
  ```

#### 22.7 Export Filtered Users CSV
- **Endpoint:** `GET /api/v1/admin/users/export`
- **Query Parameters:** Matching `GET /api/v1/admin/users` filters
- **Response Format:** `text/csv` stream attachment.

---

### 23. Normalized Module Routing Matrix

All endpoints adhere strictly to `/api/v1/<module>` namespaces:

| Module Namespace | Route Mount Point | Target Subsystem | Implementation Status |
| :--- | :--- | :--- | :--- |
| **System Health** | `/api/v1/health` | Service Telemetry & MongoDB Ping | Active |
| **Authentication** | `/api/v1/auth` | JWT, Refresh Tokens, Magic Link, RBAC | Module Structure Ready |
| **Super Admin** | `/api/v1/super-admin` | Platform Flags, Global Config, System Overview | Module Structure Ready |
| **Admin & Staff** | `/api/v1/admin` | Staff Actions, Store Approvals, `/admin/users` | Module Structure Ready |
| **Store Partner** | `/api/v1/store` | Store Console, Onboarding, `/store/dashboard` | Module Structure Ready |
| **User Kiosk** | `/api/v1/user` | Upload Flow, Document Previews, Kiosk Routing | Module Structure Ready |
| **Print Orders** | `/api/v1/orders` | Spooler Queue, Job State Machine, Page Calculus | Module Structure Ready |
| **Payments** | `/api/v1/payments` | Razorpay / UPI Gateway Orders & Webhooks | Module Structure Ready |
| **Printer Service** | `/api/v1/printer` | Hardware Telemetry, Spooler Heartbeat | Module Structure Ready |
| **QR System** | `/api/v1/qr` | Standee Generation, Dynamic QR Resolution | Module Structure Ready |
| **Notifications** | `/api/v1/notifications` | User / Store Alerts & Low Stock Alarms | Module Structure Ready |
| **Audit Logs** | `/api/v1/audit` | Immutable Administrative Action Trail | Module Structure Ready |
| **Analytics** | `/api/v1/analytics` | Revenue & Print Volume Metrics | Module Structure Ready |

---

### 24. Store Partner Onboarding & Authentication Endpoints

#### 24.1 Store Onboarding & Registration
- **Endpoint:** `POST /api/v1/store/onboard`
- **Description:** Transactionally registers a new physical print store, owner details, location coordinates, bank payout account, default price configuration, and generates linked QR standee token.
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "storeDetails": {
      "storeName": "Guwahati Xerox Hub",
      "ownerName": "Diganta Borah",
      "email": "printhub.guwahati@gmail.com",
      "phone": "9864012345",
      "alternatePhone": "9864098765",
      "password": "SecurePassword123",
      "storeAddress": "Shop No. 4, Opposite Cotton University, Panbazar",
      "city": "Guwahati",
      "state": "Assam",
      "country": "India",
      "pinCode": "781001",
      "gstNumber": "18AABCU9603R1ZM",
      "storeImage": "https://res.cloudinary.com/.../store_image.jpg"
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
    "message": "Store partner registered successfully.",
    "data": {
      "storeId": "66d1234567890abcdef12345",
      "storeCode": "SP-1001",
      "storeName": "Guwahati Xerox Hub",
      "ownerName": "Diganta Borah",
      "email": "printhub.guwahati@gmail.com",
      "phone": "9864012345",
      "qrToken": "qr_sp_sp-1001_1725000000000",
      "storeToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "timestamp": "2026-08-30T12:00:00.000Z"
  }
  ```

#### 24.2 Store Partner Login
- **Endpoint:** `POST /api/v1/store/login`
- **Description:** Authenticates store operator against MongoDB using email/mobile and bcrypt password hash; returns JWT session token.
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "emailOrPhone": "printhub.guwahati@gmail.com",
    "password": "SecurePassword123"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store logged in successfully.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "store": {
        "id": "66d1234567890abcdef12345",
        "storeCode": "SP-1001",
        "storeName": "Guwahati Xerox Hub",
        "ownerName": "Diganta Borah",
        "email": "printhub.guwahati@gmail.com",
        "phone": "9864012345",
        "address": "Shop No. 4, Opposite Cotton University, Panbazar",
        "city": "Guwahati",
        "state": "Assam",
        "pincode": "781001",
        "storeImage": "https://res.cloudinary.com/.../store_image.jpg",
        "status": "ACTIVE",
        "isVerified": true
      }
    },
    "timestamp": "2026-08-30T12:00:00.000Z"
  }
  ```

#### 24.3 Cloudinary Asset Upload
- **Endpoint:** `POST /api/v1/store/upload-asset`
- **Description:** Streams storefront branding image or photo to Cloudinary and returns secure URL.
- **Content-Type:** `multipart/form-data` (`image` binary file)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store image uploaded successfully to Cloudinary.",
    "data": {
      "url": "https://res.cloudinary.com/cloudname/image/upload/v1234567890/selfprint/stores/store_12345.jpg",
      "publicId": "selfprint/stores/store_12345"
    },
    "timestamp": "2026-08-30T12:00:00.000Z"
  }
  ```

---

### 25. Platform Administrator Authentication Endpoints

#### 25.1 Admin Login
- **Endpoint:** `POST /api/v1/admin/auth/login`
- **Description:** Authenticates platform administrators against the dedicated `admins` collection exclusively.
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "email": "das01subhamj@gmail.com",
    "password": "Subham@Admin2026!"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Administrator logged in successfully.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "admin": {
        "id": "6a93d299279836b75ae641ce",
        "name": "Subham",
        "displayName": "Super Admin",
        "email": "das01subhamj@gmail.com",
        "role": "SUPER_ADMIN",
        "status": "ACTIVE",
        "permissions": ["FULL_ACCESS", "*"],
        "avatar": "",
        "lastLogin": "2026-08-30T12:20:00.000Z"
      }
    },
    "timestamp": "2026-08-30T12:20:00.000Z"
  }
  ```

#### 25.2 Get Current Admin Profile
- **Endpoint:** `GET /api/v1/admin/auth/me`
- **Description:** Returns the authenticated administrator's verified profile details.
- **Authentication:** Admin Bearer Token
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Admin profile retrieved successfully.",
    "data": {
      "id": "6a93d299279836b75ae641ce",
      "name": "Subham",
      "displayName": "Super Admin",
      "email": "das01subhamj@gmail.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "permissions": ["FULL_ACCESS", "*"],
      "avatar": "",
      "createdAt": "2026-08-30T12:20:00.000Z"
    },
    "timestamp": "2026-08-30T12:20:00.000Z"
  }
  ```

#### 25.3 Admin Logout
- **Endpoint:** `POST /api/v1/admin/auth/logout`
- **Description:** Logs out administrator and logs an immutable audit event in `audit_logs`.
- **Authentication:** Admin Bearer Token
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully.",
    "data": {
      "success": true
    },
    "timestamp": "2026-08-30T12:20:00.000Z"
  }
  ```

#### 25.4 Admin Google OAuth Login
- **Endpoint:** `POST /api/v1/admin/auth/google`
- **Description:** Authenticates administrator with Google OAuth ID token or access token. Verifies email against whitelisted administrators in dedicated `admins` collection (with auto-provision for Super Admin `das01subhamj@gmail.com`).
- **Authentication:** None (Public)
- **Request Body (`application/json`):**
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
    "accessToken": "ya29.a0AWY7Ckm..."
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Administrator authenticated successfully via Google.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "admin": {
        "id": "66d1f08e495f87b8f9e28a01",
        "name": "Subham",
        "displayName": "Super Admin",
        "email": "das01subhamj@gmail.com",
        "role": "SUPER_ADMIN",
        "status": "ACTIVE",
        "permissions": ["FULL_ACCESS", "*"],
        "avatar": "https://lh3.googleusercontent.com/a/...",
        "lastLogin": "2026-09-02T15:30:00.000Z"
      }
    },
    "timestamp": "2026-09-02T15:30:00.000Z"
  }
  ```
- **Error Response (`403 Forbidden`):**
  ```json
  {
    "success": false,
    "message": "This Google account is not authorized to access the Self Print Admin Portal.",
    "errorCode": "FORBIDDEN",
    "timestamp": "2026-09-02T15:30:00.000Z"
  }
  ```

#### 25.5 Authenticated Admin Profile (`GET /api/v1/admin/auth/me` & `GET /api/v1/auth/me`)
- **Endpoint:** `GET /api/v1/admin/auth/me`
- **Description:** Retrieves the current authenticated administrator's profile, role, and $O(1)$ resolved object permissions.
- **Authentication:** Admin Bearer Token
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Current user profile fetched successfully",
    "data": {
      "id": "66d1f08e495f87b8f9e28a01",
      "name": "Subham",
      "displayName": "Super Admin",
      "email": "das01subhamj@gmail.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "department": "Executive Operations",
      "permissions": {
        "dashboard": { "view": true },
        "stores": { "view": true, "create": true, "edit": true, "delete": true, "export": true, "approve": true, "manage": true },
        "users": { "view": true, "create": true, "edit": true, "delete": true, "export": true, "manage": true },
        "transactions": { "view": true, "export": true, "manage": true },
        "revenue": { "view": true, "export": true, "manage": true },
        "printers": { "view": true, "create": true, "edit": true, "delete": true, "approve": true, "manage": true },
        "support": { "view": true, "create": true, "edit": true, "delete": true, "manage": true },
        "analytics": { "view": true, "export": true },
        "settings": { "view": true, "edit": true, "manage": true },
        "access": { "view": true, "create": true, "edit": true, "delete": true, "manage": true },
        "audit": { "view": true, "export": true },
        "system": { "view": true, "edit": true, "manage": true }
      },
      "avatar": "",
      "isSuperAdmin": true
    },
    "timestamp": "2026-09-02T16:00:00.000Z"
  }
  ```

#### 25.6 Invite Staff Member (`POST /api/v1/admin/access/invite`)
- **Endpoint:** `POST /api/v1/admin/access/invite`
- **Description:** Invites a new staff administrator, assigning role-template or custom $O(1)$ permission overrides, and registers the invitation in `audit_logs`.
- **Authentication:** Admin Bearer Token (requires `access.create` permission)
- **Request Body (`application/json`):**
  ```json
  {
    "fullName": "Priya Sharma",
    "email": "priya.sharma@selfprint.com",
    "phone": "+91 98765 43210",
    "role": "Manager",
    "department": "Store Operations",
    "sendEmailInvite": true,
    "permissions": {
      "dashboard": { "view": true },
      "stores": { "view": true, "create": true, "edit": true, "delete": false, "approve": true },
      "printers": { "view": true, "edit": true, "approve": true }
    }
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Staff member invited successfully.",
    "data": {
      "id": "66d1f08e495f87b8f9e28a55",
      "fullName": "Priya Sharma",
      "email": "priya.sharma@selfprint.com",
      "role": "Manager",
      "department": "Store Operations",
      "status": "Pending Invitation",
      "permissions": {
        "dashboard": { "view": true },
        "stores": { "view": true, "create": true, "edit": true, "delete": false, "approve": true },
        "printers": { "view": true, "edit": true, "approve": true }
      }
    },
    "timestamp": "2026-09-02T16:00:00.000Z"
  }
  ```
- **Validation Error (`422 Unprocessable Entity`):**
  ```json
  {
    "success": false,
    "message": "Full Name, Email, and Role are required to invite staff.",
    "errorCode": "VALIDATION_ERROR",
    "timestamp": "2026-09-02T16:00:00.000Z"
  }
  ```

### 15.6 Resend Staff Invitation
- **URL:** `/api/v1/admin/access/:id/resend-invite`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Description:** Generates a new cryptographic activation token, invalidates old token, and sends a fresh 48-hour invitation email.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Invitation resent successfully.",
    "data": {
      "id": "66d1f08e495f87b8f9e28a55",
      "email": "priya.sharma@selfprint.com",
      "status": "Pending Invitation",
      "emailStatus": "SENT",
      "inviteExpiresAt": "2026-09-04T16:00:00.000Z"
    }
  }
  ```

### 15.7 Cancel Staff Invitation
- **URL:** `/api/v1/admin/access/:id/cancel-invite`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Description:** Soft-deletes pending staff account, invalidates token, and marks invitation as revoked.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Invitation cancelled successfully.",
    "data": null
  }
  ```

### 15.8 Verify Invitation Token
- **URL:** `/api/v1/admin/auth/verify-invitation/:token`
- **Method:** `GET`
- **Description:** Public endpoint to verify cryptographic invitation token validity and return invitee details.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Invitation verified successfully.",
    "data": {
      "valid": true,
      "name": "Priya Sharma",
      "displayName": "Priya Sharma",
      "email": "priya.sharma@selfprint.com",
      "role": "Manager",
      "department": "Store Operations"
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `{ "success": false, "message": "Invitation not found or link is invalid." }`
  - `409 Conflict`: `{ "success": false, "message": "This administrator account has already been activated. Please sign in with Google." }`
  - `410 Gone`: `{ "success": false, "message": "This invitation link has expired (48 hours limit). Please ask Super Admin to resend your invite." }`

### 15.9 Activate Invited Staff with Google OAuth
- **URL:** `/api/v1/admin/auth/activate-google`
- **Method:** `POST`
- **Payload:**
  ```json
  {
    "token": "a1b2c3d4e5f6...",
    "credential": "<GOOGLE_ID_TOKEN>"
  }
  ```
- **Description:** Verifies Google ID Token against OAuth2Client, strictly verifies that Google email matches invited email, activates account (`status: ACTIVE`, `isActivated: true`), triggers welcome email, and returns JWT session.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Account activated successfully.",
    "token": "<SIGNED_JWT_SESSION>",
    "user": {
      "id": "66d1f08e495f87b8f9e28a55",
      "name": "Priya Sharma",
      "displayName": "Priya Sharma",
      "email": "priya.sharma@selfprint.com",
      "role": "Manager",
      "status": "ACTIVE",
      "department": "Store Operations",
      "permissions": { ... }
    }
  }
  ```
- **Error Responses:**
  - `403 Forbidden`: `{ "success": false, "message": "This Google account (other@gmail.com) was not invited. Please sign in with priya.sharma@selfprint.com." }`
  - `410 Gone`: `{ "success": false, "message": "This invitation link has expired." }`















