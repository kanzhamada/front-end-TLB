## View Messages by Reservation ID

# Route ini digunakan untuk mengambil semua pesan dalam suatu chat berdasarkan ID Reservasi. Pemanggilan route ini secara otomatis menandai pesan-pesan yang diterima sebagai sudah dibaca (read: true).

Endpoint : GET /shared/view-chat/:id

## Path Parameter : | Parameter | Tipe | Deskripsi | | :--- | :--- | :--- | | id | UUID | ID Reservasi (reservationID) yang terkait dengan chat. |

Header :
Authorization : Bearer <token>

Response Body Success (200 OK):

```json
{
	"success": true,
	"message": "Messages retrieved successfully and marked as read.",
	"data": {
		"chatID": "e4c7d0d0-7a0e-4f3b-8c8a-1d2a3e4f5a6b",
		"reservationID": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
		"messagesDetail": [
			{
				"content": "Pesan pertama dari customer.",
				"sender": "customer-uuid",
				"created_at": "2025-11-19T10:00:00Z",
				"read": true
			},
			{
				"content": "Balasan dari admin.",
				"sender": "admin-uuid",
				"created_at": "2025-11-19T10:01:00Z",
				"read": true
			}
		]
	},
	"timestamp": "2025-11-19T13:25:09.532Z",
	"status": 200
}
```

Response Body Error (400 Bad Request):

```json
{
	"success": false,
	"message": "Reservation ID is required",
	"error": null
}
```

## Create Message

# Route ini digunakan untuk mengirim pesan baru ke dalam chat yang sudah ada.

Endpoint : POST /shared/create-message/:id

## Path Parameter : | Parameter | Tipe | Deskripsi | | :--- | :--- | :--- | | id | UUID | ID Chat (chatID) tempat pesan akan dikirim. |

Header :
Authorization : Bearer <token>

Request Body :

```json
{
	"content": "Apakah saya bisa mengubah jadwal potong rambut saya?"
	// Kolom "sender" otomatis diambil dari token pengguna.
}
```

Response Body Success (200 OK):

```json
{
	"success": true,
	"message": "Message created successfully.",
	"data": {
		"sender": "user-uuid-abc",
		"content": "Apakah saya bisa mengubah jadwal potong rambut saya?"
	}
}
```

Response Body Error (400 Bad Request):

```json
{
	"success": false,
	"message": "Chat ID is required",
	"error": null
}
```

## Admin Chat Inbox

# Route ini digunakan oleh Admin untuk mendapatkan daftar semua chat room yang aktif, menampilkan pesan terakhir, dan hitungan pesan yang belum dibaca oleh Admin.

Endpoint : GET /admin/chat-inbox

Headers :
Authorization : Bearer <admin_token>

Response Body Success (200 OK)

```json
{
	"success": true,
	"message": "Admin chat inbox retrieved successfully.",
	"data": [
		{
			"chatID": "e4c7d0d0-7a0e-4f3b-8c8a-1d2a3e4f5a6b",
			"reservationID": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
			"customer_name": "Budi Hartono",
			"last_message": "Apakah reservasi saya sudah bisa diubah?",
			"last_sent_at": "2025-11-20T08:15:00Z",
			"unread_count": 2
		},
		{
			"chatID": "f5d8e9c1-4b7a-8c9d-1e2f-3a4b5c6d7e8f",
			"reservationID": "09876543-210e-fedc-ba98-76543210abcd",
			"customer_name": "Siti Aminah",
			"last_message": "Terima kasih atas konfirmasinya.",
			"last_sent_at": "2025-11-19T14:30:00Z",
			"unread_count": 0
		}
	]
}
```

Note: Response ini mengembalikan array dari objek chat (inbox).

Response Body Error (401 Unauthorized / 500 Internal Server Error)

```json
{
	"success": false,
	"message": "Admin User ID not found in context.",
	"error": null
}
```
