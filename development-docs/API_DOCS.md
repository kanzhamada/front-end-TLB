# API Documentation

**Base URL**: `http://localhost:3000`

**Standard Response Format**:
All API responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "timestamp": "ISO-8601 String",
  "status": number
}
```

---

## Authentication

### Register New User
**Endpoint**: `POST /auth/register`

**Headers**:
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "phone": "08123456789"
}
```

**Response Body Success (201)**:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to confirm your account.",
  "data": {
    "user": {
      "id": "user-uuid",
      "aud": "authenticated",
      "role": "authenticated",
      "email": "user@example.com",
      "phone": "08123456789",
      "user_metadata": {
        "displayName": "John Doe",
        "phone": "08123456789"
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 201
}
```

**Response Body Error (400)**:
```json
{
  "success": false,
  "message": "Email, password and display name are required",
  "error": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 400
}
```

### Login
**Endpoint**: `POST /auth/login`

**Headers**:
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "jwt-token-string",
      "token_type": "bearer",
      "expires_in": 3600,
      "refresh_token": "refresh-token-string",
      "user": { ... }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Logout
**Endpoint**: `POST /auth/logout`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Request Body**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Logout successful.",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

---

## Customer Endpoints

### View Profile
**Endpoint**: `GET /customer/view-profile`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "displayName": "John Doe",
    "email": "user@example.com",
    "phone": "08123456789"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Update Profile
**Endpoint**: `PUT /customer/update-profile`

**Headers**:
- `Authorization`: `Bearer <access_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "displayName": "Jane Doe",
  "phone": "08987654321"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Profile update successfully.",
  "data": {
    "displayName": "Jane Doe",
    "email": "user@example.com",
    "phone": "08987654321"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Create Reservation
**Endpoint**: `POST /customer/create-reservation`

**Headers**:
- `Authorization`: `Bearer <access_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "barberId": "barber-uuid",
  "serviceId": "service-uuid",
  "dateTimeId": "datetime-uuid",
  "notes": "Short hair please",
  "voucherId": "voucher-uuid",
  "redeemCode": "PROMO2023",
  "paymentMethod": "gopay"
}
```
*Note: `notes`, `voucherId`, and `redeemCode` are optional. `paymentMethod` is required (e.g., 'gopay', 'bank_transfer', 'qris', 'shopeepay', 'dana').*

**Response Body Success (201)**:
```json
{
  "success": true,
  "message": "Reservation created successfully.",
  "data": {
    "id": "reservation-uuid",
    "user_id": "user-uuid",
    "barber_id": "barber-uuid",
    "service_id": "service-uuid",
    "status": "Pending",
    "created_at": "..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 201
}
```

### Create Payment Transaction
**Endpoint**: `POST /payments/create-transaction`

**Headers**:
- `Authorization`: `Bearer <access_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "reservationId": "reservation-uuid"
}
```
*Note: `paymentMethod` is now retrieved from the reservation details.*

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "token": "midtrans-snap-token",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Reservation History
**Endpoint**: `GET /customer/view-reservation`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Reservation history retrieved successfully",
  "data": [
    {
      "id": "reservation-uuid",
      "service": { "name": "Haircut", "price": 50000 },
      "barber": { "name": "Barber John" },
      "status": "Completed",
      "date": "2024-01-20"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Detail Reservation
**Endpoint**: `GET /customer/view-detail-reservation/:id`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Reservation details retrieved successfully",
  "data": {
    "reservationID": "reservation-uuid",
    "service": { "name": "Haircut", "price": 50000 },
    "barber": { "name": "Barber John" },
    "status": "Pending",
    "date": "2024-01-20",
    "time": "10:00"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Reschedule Reservation
**Endpoint**: `PUT /customer/reschedule-reservation/:id`

**Headers**:
- `Authorization`: `Bearer <access_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "dateTimeId": "new-datetime-uuid"
}
```

**Response Body Success (201)**:
```json
{
  "success": true,
  "message": "Reschedule request sent successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 201
}
```

### Cancel Reservation
**Endpoint**: `PUT /customer/cancel-reservation/:id`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Reservation cancelled successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Available Vouchers
**Endpoint**: `GET /customer/view-available-voucher`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Vouchers fetched successfully",
  "data": [ ... ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Owned Vouchers
**Endpoint**: `GET /customer/view-owned-voucher`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Vouchers fetched successfully",
  "data": [ ... ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Coin History
**Endpoint**: `GET /customer/view-coin-history`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Vouchers fetched successfully",
  "data": [ ... ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Buy Voucher
**Endpoint**: `POST /customer/buy-voucher`

**Headers**:
- `Authorization`: `Bearer <access_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "voucherId": "voucher-uuid"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Voucher purchased successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Reservation Vouchers
**Endpoint**: `GET /customer/reservation-vouchers/:serviceId`

**Headers**:
- `Authorization`: `Bearer <access_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Reservation vouchers fetched successfully",
  "data": [ ... ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

---

## Admin Endpoints

### Get Dashboard Info
**Endpoint**: `GET /admin/dashboard-info`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Dashboard info fetched successfully",
  "data": {
    "operational": {
      "unread_chat_count": 5,
      "pending_actions": [
        {
          "reservationID": "uuid",
          "customerName": "John Doe",
          "serviceName": "Haircut",
          "barberName": "Barber A",
          "date": "2024-01-20",
          "time": "10:00",
          "status": "waiting"
        }
      ],
      "ongoing_reservations": [
        {
          "reservationID": "uuid",
          "customerName": "John Doe",
          "serviceName": "Haircut",
          "barberName": "Barber A",
          "date": "2024-01-20", // TODAY
          "time": "10:00",
          "status": "pending"
        }
      ],
      "upcoming_reservations": [
        {
          "reservationID": "uuid",
          "customerName": "Bob Smith",
          "serviceName": "Shave",
          "date": "2024-01-21",
          "time": "09:00"
        }
      ]
    },
    "finance_overview": {
      "today": { "online": 100000, "offline": 50000, "total": 150000 },
      "week": { "online": 500000, "offline": 300000, "total": 800000 },
      "month": { "online": 2000000, "offline": 1500000, "total": 3500000 }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Reservation Details
**Endpoint**: `GET /admin/view-reservation/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Reservation details fetched successfully",
  "data": {
    "reservationID": "reservation-uuid",
    "user": {
      "name": "John Doe",
      "phone": "08123456789",
      "email": "user@example.com",
      "photo": "url"
    },
    "service": {
      "name": "Haircut",
      "price": 50000
    },
    "barber": {
      "name": "Barber John"
    },
    "date": "2024-01-20",
    "time": "10:00",
    "status": "requestToReschedule",
    "payment": {
      "status": "paid",
      "total": 50000,
      "downPayment": 25000
    },
    "reschedule": {
      "newDate": "2024-01-21",
      "newTime": "14:00"
    },
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```
*Note: `reschedule` field will be `null` if there is no active reschedule request.*


### Complete Reservation
**Endpoint**: `PUT /admin/complete-reservation/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Reservation completed successfully",
  "data": {
     "reservationID": "uuid",
     "status": "completed",
     "updated_at": "..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Create Barber
**Endpoint**: `POST /admin/create-barber`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "name": "Barber John",
  "phoneNumber": "08123456789",
  "experience": "5 Years",
  "skills": "Fade, Scissor Cut"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Barber created successfully.",
  "data": {
    "id": "barber-uuid",
    "name": "Barber John",
    "phoneNumber": "08123456789",
    "active": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Delete Barber
**Endpoint**: `DELETE /admin/delete-barber/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Description**:
Soft deletes a barber by setting their `deleted_at` timestamp. The barber will no longer appear in active lists but historical data is preserved.

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Barber deleted successfully.",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Create Service
**Endpoint**: `POST /admin/create-service`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "name": "Premium Haircut",
  "price": 100000,
  "description": "Full service haircut with wash"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Service create successfully.",
  "data": {
    "id": "service-uuid",
    "name": "Premium Haircut",
    "price": 100000
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Vouchers
**Endpoint**: `GET /admin/view-voucher`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Vouchers fetched successfully",
  "data": [
    {
      "voucherID": "voucher-uuid",
      "title": "Discount 10%",
      "value": 10000,
      "type": "voucher",
      "startDate": "2024-01-01",
      "expireDate": "2024-01-31",
      "description": "January Promo"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Create Voucher
## type : redeem_code / voucher
**Endpoint**: `POST /admin/create-voucher`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "type": "voucher",
  "title": "New Year Promo",
  "value": 20000,
  "startDate": "2024-01-01",
  "expireDate": "2024-01-31",
  "description": "Special discount",
  "price": 0
}
```
*Note: For `type`="redeem_code", add `"code": "PROMO2024"`.*

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Voucher create successfully.",
  "data": {
    "id": "voucher-uuid",
    "title": "New Year Promo",
    "value": 20000,
    "type": "voucher"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Update Voucher
**Endpoint**: `PUT /admin/update-voucher/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "type": "voucher",
  "title": "Updated Promo",
  "value": 25000,
  "startDate": "2024-01-01",
  "expireDate": "2024-02-28",
  "description": "Extended discount"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Voucher update successfully.",
  "data": {
    "id": "voucher-uuid",
    "title": "Updated Promo",
    "value": 25000
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Delete Voucher
**Endpoint**: `DELETE /admin/delete-voucher/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Voucher delete successfully.",
  "data": {
    "success": true,
    "message": "Voucher deleted successfully"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Create Operational Schedule
**Endpoint**: `POST /admin/create-operational`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "date": "2024-01-25",
  "hour": ["10:00", "11:00", "13:00", "14:00"]
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Operational create successfully.",
  "data": {
    "id": "operational-uuid",
    "date": "2024-01-25",
    "hour": ["10:00", "11:00", "13:00", "14:00"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

---

### Update Weekly Schedule
**Endpoint**: `PUT /admin/update-schedule`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "sunday": ["10:00"],
  "monday": ["10:00"],
  "tuesday": ["10:00"],
  "wednesday": ["10:00"],
  "thursday": ["10:00"],
  "friday": ["10:00"],
  "saturday": ["10:00"]
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Schedule create successfully.",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Update Operational
**Endpoint**: `PUT /admin/update-operational/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "date": "2024-01-25",
  "hour": ["10:00", "12:00"]
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Operational update successfully.",
  "data": { ... },
}
```

### Create Catalogue
**Endpoint**: `POST /admin/create-catalogue`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `multipart/form-data`

**Request Body (FormData)**:
- `file`: File (Image)
- `name`: String
- `type`: String ("short" | "long" | "medium")
- `description`: String
- `hairTypes`: String
- `faceShapes`: String
- `skinTones`: String

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Catalogue created successfully.",
  "data": {
    "id": "catalogue-uuid",
    "name": "Catalogue Name",
    "type": "short",
    "description": "Description",
    "hairTypes": "Lurus",
    "faceShapes": "Oval",
    "skinTones": "Sawo Matang",
    "imageUrl": "https://..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Update Catalogue
**Endpoint**: `PUT /admin/update-catalogue/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `multipart/form-data`

**Request Body (FormData)**:
- `file`: File (Image)
- `name`: String
- `type`: String ("short" | "long" | "medium")
- `description`: String
- `hairTypes`: String
- `faceShapes`: String
- `skinTones`: String
- `deletedImageIds`: String (JSON Array of Strings, e.g., `["uuid1", "uuid2"]`)

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Catalogue update successfully.",
  "data": {
    "id": "catalogue-uuid",
    "name": "Updated Name",
    "type": "long",
    "description": "Updated Description",
    "hairTypes": "Keriting",
    "faceShapes": "Bulat",
    "skinTones": "Putih",
    "imageUrl": "https://..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Delete Catalogue
**Endpoint**: `DELETE /admin/delete-catalogue/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Catalogue delete successfully.",
  "data": {
    "success": true,
    "message": "Catalogue deleted successfully"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

---

### Chat Inbox
**Endpoint**: `GET /admin/chat-inbox`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Admin chat inbox retrieved successfully.",
  "data": [
    {
      "chatID": "chat-uuid",
      "reservationID": "reservation-uuid",
      "customerName": "John Doe",
      "customerPhoto": "https://...",
      "lastMessage": "Hello, I need to reschedule",
      "lastMessageTime": "2024-01-15T10:35:00Z",
      "unreadCount": 2
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

---

### Finance: Create Offline Income
**Endpoint**: `POST /admin/offline-income`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "date": "2023-10-27",
  "type": "Tunai",
  "serviceId": "service-uuid"
}
```
*Note: `type` must be 'Tunai' or 'QRIS'.*

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Offline income created successfully",
  "data": {
    "success": true,
    "message": "Offline income recorded successfully",
    "id": "offline-income-uuid"
  },
  "timestamp": "...",
  "status": 200
}
```

### Finance: View Offline Income
**Endpoint**: `GET /admin/offline-income`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Offline income fetched successfully",
  "data": [
    {
      "id": "offline-income-uuid",
      "date": "2023-10-27",
      "type": "Tunai",
      "price": 50000,
      "service": {
        "id": "service-uuid",
        "name": "Haircut"
      }
    }
  ],
  "timestamp": "...",
  "status": 200
}
```

### Finance: Update Offline Income
**Endpoint**: `PUT /admin/offline-income/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "date": "2023-10-28",
  "type": "QRIS",
  "serviceId": "new-service-uuid"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Offline income updated successfully",
  "data": {
    "success": true,
    "message": "Offline income updated successfully"
  },
  "timestamp": "...",
  "status": 200
}
```

### Finance: Delete Offline Income
**Endpoint**: `DELETE /admin/offline-income/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Offline income deleted successfully",
  "data": {
    "success": true,
    "message": "Offline income deleted successfully"
  },
  "timestamp": "...",
  "status": 200
}
```

### Finance: Create Expense
**Endpoint**: `POST /admin/expenses`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "date": "2023-10-27",
  "description": "Electricity Bill",
  "nominal": 500000,
  "category": "Utilities"
}
```
*Note: `category` is optional, defaults to 'General'.*

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "success": true,
    "message": "Expense recorded successfully",
    "id": "expense-uuid"
  },
  "timestamp": "...",
  "status": 200
}
```

### Finance: View Expenses
**Endpoint**: `GET /admin/expenses`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Query Parameters**:
- `startDate` (Optional): "YYYY-MM-DD"
- `endDate` (Optional): "YYYY-MM-DD"

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Expenses fetched successfully",
  "data": [
    {
      "id": "expense-uuid",
      "date": "2023-10-27",
      "description": "Electricity Bill",
      "nominal": 500000,
      "category": "Utilities"
    }
  ],
  "timestamp": "...",
  "status": 200
}
```

### Finance: Update Expense
**Endpoint**: `PUT /admin/expenses/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "date": "2023-10-28",
  "description": "Water Bill",
  "nominal": 200000,
  "category": "Utilities"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "success": true,
    "message": "Expense updated successfully"
  },
  "timestamp": "...",
  "status": 200
}
```

### Finance: Delete Expense
**Endpoint**: `DELETE /admin/expenses/:id`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "data": {
    "success": true,
    "message": "Expense deleted successfully"
  },
  "timestamp": "...",
  "status": 200
}
```

### Finance: Get Cash Flow Stats
**Endpoint**: `GET /admin/cash-flow-stats`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Cash flow stats fetched successfully",
  "data": {
    "daily": {
      "revenue": {
        "total": 150000,
        "online": {
           "total": 100000,
           "downPayment": 50000,
           "settlement": 50000
        },
        "offline": {
           "total": 50000,
           "cash": 30000,
           "qris": 20000
        }
      },
      "expenses": {
        "total": 50000
      },
      "netProfit": 100000
    },
    "weekly": { ... },
    "monthly": { ... },
    "charts": {
      "weekly": [
        { "label": "Monday", "revenue": 50000, "expenses": 10000 },
        { "label": "Tuesday", "revenue": 70000, "expenses": 20000 }
      ],
      "monthly": [
        { "label": "Week 1", "revenue": 300000, "expenses": 100000 },
        { "label": "Week 2", "revenue": 450000, "expenses": 150000 }
      ],
      "yearly": [
        { "label": "January", "revenue": 1500000, "expenses": 500000 },
        { "label": "February", "revenue": 1800000, "expenses": 600000 }
      ]
    }
  },
  "timestamp": "...",
  "status": 200
}
```

### Finance: View Unified Income History
**Endpoint**: `GET /admin/income`

**Headers**:
- `Authorization`: `Bearer <admin_token>`

**Query Parameters**:
- `startDate` (Optional): "YYYY-MM-DD"
- `endDate` (Optional): "YYYY-MM-DD"

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Income history fetched successfully",
  "data": [
    {
      "id": "uuid",
      "date": "2024-01-20",
      "source": "Online",
      "type": "Down Payment",
      "amount": 50000,
      "description": "Haircut - John Doe"
    },
    {
      "id": "uuid",
      "date": "2024-01-19",
      "source": "Offline",
      "type": "Tunai",
      "amount": 100000,
      "description": "Premium Shave"
    }
  ],
  "timestamp": "...",
  "status": 200
}
```

### Finance: View Offline Income
**Endpoint**: `GET /admin/offline-income`

**Query Parameters**:
- `startDate` (Optional): "YYYY-MM-DD"
- `endDate` (Optional): "YYYY-MM-DD"
    "monthly": { ... }
  },
  "timestamp": "...",
  "status": 200
}
```

---

## Shared Endpoints

### View Barbers (Public)
**Endpoint**: `GET /shared/view-barber`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Barbers fetched successfully",
  "data": [
    {
      "id": "barber-uuid",
      "name": "Barber John",
      "phoneNumber": "08123456789"
    },
    {
      "id": "barber-uuid-2",
      "name": "Barber Doe",
      "phoneNumber": "08987654321"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Catalogues (Public)
**Endpoint**: `GET /shared/view-catalogue`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Catalogues fetched successfully",
  "data": [
    {
      "id": "catalogue-uuid",
      "name": "Catalogue Name",
      "type": "short",
      "description": "Description",
      "hairTypes": "Lurus",
      "faceShapes": "Oval",
      "skinTones": "Sawo Matang",
      "imageUrl": "https://..."
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Catalogue by ID (Public)
**Endpoint**: `GET /shared/view-catalogue/:id`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Catalogue fetched successfully.",
  "data": {
    "id": "catalogue-uuid",
    "name": "Catalogue Name",
    "type": "short",
    "description": "Description",
    "hairTypes": "Lurus",
    "faceShapes": "Oval",
    "skinTones": "Sawo Matang",
    "imageUrl": "https://..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Services (Public)
**Endpoint**: `GET /shared/view-service`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Services fetched successfully",
  "data": [
    {
      "id": "service-uuid",
      "name": "Regular Cut",
      "price": 50000,
      "description": "Standard haircut"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Operational Schedule
**Endpoint**: `GET /shared/view-operational`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Operationals fetched successfully",
  "data": [
    {
      "id": "operational-uuid",
      "date": "2024-01-25",
      "hour": ["10:00", "11:00"]
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Operational by Date
**Endpoint**: `GET /shared/view-operational/:id`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Operational fetched successfully.",
  "data": {
    "id": "operational-uuid",
    "date": "2024-01-25",
    "hour": ["10:00", "11:00"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Weekly Schedule
**Endpoint**: `GET /shared/view-schedule`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Scheduke fetched successfully",
  "data": [
    {
      "day": "Monday",
      "hours": ["10:00", "11:00"]
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Voucher by ID
**Endpoint**: `GET /shared/view-voucher/:id`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Voucher fetched successfully.",
  "data": {
    "voucherID": "voucher-uuid",
    "title": "Discount 10%",
    "value": 10000,
    "type": "voucher"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### View Chat Messages
**Endpoint**: `GET /shared/view-chat/:reservationId`

**Headers**:
- `Authorization`: `Bearer <token>`

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Messages retrieved successfully and marked as read.",
  "data": {
    "chatID": "chat-uuid",
    "reservationID": "reservation-uuid",
    "customerPhone": "081234567890",
    "messagesDetail": [
      {
        "sender": "user-uuid",
        "content": "Hello, can I reschedule?",
        "created_at": "2024-01-15T10:35:00Z"
      },
      {
        "sender": "admin-uuid",
        "content": "Sure, what time?",
        "created_at": "2024-01-15T10:36:00Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Create Chat Message
**Endpoint**: `POST /shared/create-message/:chatId`

**Headers**:
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "content": "I will arrive 5 minutes late."
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Message created successfully.",
  "data": {
    "id": "message-uuid",
    "chat_id": "chat-uuid",
    "sender": "user-uuid",
    "content": "I will arrive 5 minutes late.",
    "created_at": "..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

---

## Webhooks

### Midtrans Notification
**Endpoint**: `POST /webhooks/midtrans`

**Headers**:
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "transaction_status": "settlement",
  "order_id": "reservation-uuid",
  "gross_amount": "50000.00",
  "signature_key": "..."
}
```

**Response Body Success (200)**:
```json
{
  "message": "Notification received"
}
```
*Note: Webhook response format differs slightly as it is a system-to-system callback.*

---

## Website Settings

### Website Settings: Get Settings (Public)
**Endpoint**: `GET /shared/settings`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Website settings retrieved successfully",
  "data": {
    "id": "uuid",
    "admin_fee": 1000,
    "vision": "Our Vision",
    "mission": "Our Mission",
    "location": "Central Park",
    "maps_link": "https://maps.google.com/...",
    "phone": "08123456789",
    "instagram": "@barbershop"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Website Settings: Update Settings (Admin)
**Endpoint**: `PUT /admin/settings`

**Headers**:
- `Authorization`: `Bearer <admin_token>`
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "admin_fee": 2000,
  "vision": "New Vision",
  "mission": "New Mission",
  "location": "New Location",
  "maps_link": "https://newmaps...",
  "phone": "08987654321",
  "instagram": "@newbarber"
}
```

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Website settings updated successfully",
  "data": {
    "id": "uuid",
    "admin_fee": 2000,
    "vision": "New Vision",
    "mission": "New Mission",
    "location": "New Location",
    "maps_link": "https://newmaps...",
    "phone": "08987654321",
    "instagram": "@newbarber",
    "updated_at": "..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```

### Payment Fees: Get Fee Structure
**Endpoint**: `GET /shared/payment-fees`

**Headers**: None

**Response Body Success (200)**:
```json
{
  "success": true,
  "message": "Payment fees details",
  "data": {
    "bank_transfer": {
      "type": "fixed",
      "value": 4000,
      "label": "Bank Transfer"
    },
    "gopay": {
      "type": "percentage",
      "value": 0.02,
      "label": "GoPay"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 200
}
```
