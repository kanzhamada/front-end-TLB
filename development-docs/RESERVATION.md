# Reservation API Spec

## Create Reservation API (Customer)

Endpoint : POST /customer/create-reservation

Headers :

- Authorization : Bearer token

Request Body :

```json
{
	"barberId": "barber-uuid",
	"serviceId": "service-uuid",
	"dateTimeId": "datetime-uuid",
	"notes": "Please cut my hair short",
	"voucherId": "voucher-uuid"
}
```

**Note**: `notes` and `voucherId` are optional fields.

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reservation created successfully.",
	"data": {
		"id": "reservation-uuid",
		"customer_id": "user-uuid",
		"barber_id": "barber-uuid",
		"service_id": "service-uuid",
		"date_time_id": "datetime-uuid",
		"status": "pending",
		"notes": "Please cut my hair short",
		"voucher_id": "voucher-uuid",
		"created_at": "2024-01-15T10:30:00Z",
		"updated_at": "2024-01-15T10:30:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Authentication required",
	"error": null
}
```

## Reservation Payments API (Customer)

Endpoint : POST /payments/create-transaction

Headers :

- Authorization : Bearer token

Request Body :

```json
{
	"reservationId": "reservation-uuid"
}
```

Response Body Success :

```json
{
	"success": true,
	"message": "Transaction created successfully",
	"data": {
		"token": "1698e389-d809-42a2-b613-993b926498a0",
		"redirect_url": "https://app.sandbox.midtrans.com/snap/v4/redirection/1698e389-d809-42a2-b613-993b926498a0"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Authentication required", // Or Reservation ID does not exist
	"error": null
}
```

## View Reservation Details API (Customer)

Endpoint : GET /customer/view-detail-reservation/:id

Headers :

- Authorization : Bearer token

URL Parameter :

- id : Reservation ID

Response Body Success :

```json
{
	"success": true,
	"message": "Reservation details fetched successfully",
	"data": [
		{
			"notes": null,
			"barber": {
				"name": "ini barber ya",
				"phoneNumber": "0081"
			},
			"status": "waiting",
			"userID": "265c8882-672a-4f6d-80d7-2de6caff26d1",
			"invoice": null,
			"service": {
				"name": "Haircut Basic",
				"price": 50000
			},
			"dateTime": {
				"date": "2025-11-05",
				"hour": "19:00:00"
			},
			"serviceID": "f023f6d8-15c6-47f8-b6f1-5d902d7c62cc",
			"dateTimeID": "6ab0f7de-0342-4460-a818-8318f837a8e2",
			"reservationID": "be2b13cf-3e11-4d79-beb4-4ad330e2c4c1"
		}
	]
}
```

## View Reservation History API (Customer)

Endpoint : GET /customer/view-reservation

Headers :

- Authorization : Bearer token

Response Body Success :

```json
{
	"success": true,
	"message": "Reservation history fetched successfully",
	"data": [
		{
			"notes": null,
			"barber": {
				"name": "ini  barber ya",
				"barberID": "0dedfeff-01f3-451c-97d8-7d2cf660c397",
				"phoneNumber": "0081"
			},
			"status": "completed",
			"userID": "265c8882-672a-4f6d-80d7-2de6caff26d1",
			"invoice": null,
			"service": {
				"name": "Haircut Basic",
				"price": 50000,
				"serviceID": "f023f6d8-15c6-47f8-b6f1-5d902d7c62cc"
			},
			"barberID": "0dedfeff-01f3-451c-97d8-7d2cf660c397",
			"dateTime": {
				"date": "2025-11-05",
				"hour": "19:00:00"
			},
			"serviceID": "f023f6d8-15c6-47f8-b6f1-5d902d7c62cc",
			"created_at": "2025-11-13T08:14:05.307037",
			"dateTimeID": "6ab0f7de-0342-4460-a818-8318f837a8e2",
			"reservationID": "be2b13cf-3e11-4d79-beb4-4ad330e2c4c1"
		},
		{
			"notes": null,
			"barber": {
				"name": "ini  barber",
				"barberID": "298efc68-0f43-4dde-8abe-80542b26e7b2",
				"phoneNumber": "0081"
			},
			"status": "waiting",
			"userID": "265c8882-672a-4f6d-80d7-2de6caff26d1",
			"invoice": null,
			"service": {
				"name": "Haircut Basic",
				"price": 50000,
				"serviceID": "f023f6d8-15c6-47f8-b6f1-5d902d7c62cc"
			},
			"barberID": "298efc68-0f43-4dde-8abe-80542b26e7b2",
			"dateTime": {
				"date": "2025-11-04",
				"hour": "19:00:00"
			},
			"serviceID": "f023f6d8-15c6-47f8-b6f1-5d902d7c62cc",
			"created_at": "2025-11-14T07:42:17.703952",
			"dateTimeID": "443220d0-4533-4f91-bceb-eae8b2eaa47f",
			"reservationID": "9d498ed6-c83a-4736-ba97-660633947236"
		}
	]
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Authentication required",
	"error": null
}
```

## Reschedule Reservation API (Customer)

Endpoint : PUT /customer/reschedule-reservation/:id

Headers :

- Authorization : Bearer token

URL Parameters :

- id : Reservation ID

Request Body :

```json
{
	"dateTimeId": "new-datetime-uuid"
}
```

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reschedule request sent",
	"data": {
		"id": "reservation-uuid",
		"status": "reschedule_requested",
		"new_date_time_id": "new-datetime-uuid",
		"updated_at": "2024-01-15T11:00:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID & dateTimeId is required",
	"error": null
}
```

## Cancel Reservation API (Customer)

Endpoint : PUT /customer/cancel-reservation/:id

Headers :

- Authorization : Bearer token

URL Parameters :

- id : Reservation ID

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reservation cancelled",
	"data": {
		"id": "reservation-uuid",
		"status": "cancelled",
		"updated_at": "2024-01-15T12:00:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": null
}
```

## View All Reservations API (Admin)

Endpoint : GET /admin/view-reservations

Headers :

- Authorization : Bearer token (Admin role required)

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reservation fetched successfully",
	"data": [
		{
			"id": "reservation-uuid",
			"customer_id": "user-uuid",
			"barber_id": "barber-uuid",
			"service_id": "service-uuid",
			"date_time_id": "datetime-uuid",
			"status": "pending",
			"notes": "Please cut my hair short",
			"voucher_id": "voucher-uuid",
			"created_at": "2024-01-15T10:30:00Z",
			"updated_at": "2024-01-15T10:30:00Z"
		}
	]
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Unauthorized",
	"error": null
}
```

## View Reservation by ID API (Admin)

Endpoint : GET /admin/view-reservation/:id

Headers :

- Authorization : Bearer token (Admin role required)

URL Parameters :

- id : Reservation ID

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reservation fetched sucessfully.",
	"data": {
		"id": "reservation-uuid",
		"customer_id": "user-uuid",
		"barber_id": "barber-uuid",
		"service_id": "service-uuid",
		"date_time_id": "datetime-uuid",
		"status": "pending",
		"notes": "Please cut my hair short",
		"voucher_id": "voucher-uuid",
		"created_at": "2024-01-15T10:30:00Z",
		"updated_at": "2024-01-15T10:30:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": undefined
}
```

## Accept Reservation API (Admin)

Endpoint : PUT /admin/accept-reservation/:id

Headers :

- Authorization : Bearer token (Admin role required)

URL Parameters :

- id : Reservation ID

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reservation accepted successfully",
	"data": {
		"id": "reservation-uuid",
		"status": "confirmed",
		"updated_at": "2024-01-15T13:00:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": undefined
}
```

## Decline Reservation API (Admin)

Endpoint : PUT /admin/decline-reservation/:id

Headers :

- Authorization : Bearer token (Admin role required)

URL Parameters :

- id : Reservation ID

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reservation declined",
	"data": {
		"id": "reservation-uuid",
		"status": "declined",
		"updated_at": "2024-01-15T13:00:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": undefined
}
```

## Cancel Reservation API (Admin)

Endpoint : PUT /admin/cancel-reservation/:id

Headers :

- Authorization : Bearer token (Admin role required)

URL Parameters :

- id : Reservation ID

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reservation declined successfully",
	"data": {
		"id": "reservation-uuid",
		"status": "cancelled",
		"updated_at": "2024-01-15T13:00:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": undefined
}
```

## Accept Reschedule Request API (Admin)

Endpoint : PUT /admin/accept-reschedule/:id

Headers :

- Authorization : Bearer token (Admin role required)

URL Parameters :

- id : Reservation ID

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reschedule request accepted",
	"data": {
		"id": "reservation-uuid",
		"status": "confirmed",
		"date_time_id": "new-datetime-uuid",
		"updated_at": "2024-01-15T13:00:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": undefined
}
```

## Decline Reschedule Request API (Admin)

Endpoint : PUT /admin/decline-reschedule/:id

Headers :

- Authorization : Bearer token (Admin role required)

URL Parameters :

- id : Reservation ID

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reschedule request declined",
	"data": {
		"id": "reservation-uuid",
		"status": "confirmed",
		"updated_at": "2024-01-15T13:00:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": undefined
}
```

## Complete Reservation API (Admin)

Endpoint : PUT /admin/complete-reservation/:id

Headers :

- Authorization : Bearer token (Admin role required)

URL Parameters :

- id : Reservation ID

Response Body Success :

```json
{
	"sucess": true,
	"message": "Reservation completed",
	"data": {
		"id": "reservation-uuid",
		"status": "completed",
		"updated_at": "2024-01-15T14:00:00Z"
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": undefined
}
```

## Reservation Status Values

- `pending` - Reservation is pending admin approval
- `confirmed` - Reservation is confirmed by admin
- `reschedule_requested` - Customer requested to reschedule
- `declined` - Reservation is declined by admin
- `cancelled` - Reservation is cancelled
- `completed` - Reservation is completed
