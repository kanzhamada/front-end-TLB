# Authentication API Spec

## Register User API

Endpoint : POST /auth/register

Request Body :

```json
{
	"email": "user@example.com",
	"password": "securepassword123",
	"displayName": "John Doe",
	"phone": "081234567890"
}
```

**Note**: `phone` is optional field.

Response Body Success :

```json
{
	"sucess": true,
	"message": "Registration successful. User is logged in.",
	"data": {
		"session": {
			"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
			"token_type": "bearer",
			"expires_in": 3600,
			"refresh_token": "refresh_token_here",
			"user": {
				"id": "user-uuid",
				"email": "user@example.com",
				"display_name": "John Doe",
				"phone": "081234567890"
			}
		}
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Email, password and display name are required",
	"error": undefined
}
```

**Error Cases**:

- Missing required fields (email, password, displayName)
- Invalid email format
- Email already registered
- Weak password (if validation is implemented)

## Login User API

Endpoint : POST /auth/login

Request Body :

```json
{
	"email": "user@example.com",
	"password": "securepassword123"
}
```

Response Body Success :

```json
{
	"sucess": true,
	"message": "Login successful.",
	"data": {
		"session": {
			"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
			"token_type": "bearer",
			"expires_in": 3600,
			"refresh_token": "refresh_token_here",
			"user": {
				"id": "user-uuid",
				"email": "user@example.com",
				"display_name": "John Doe",
				"phone": "081234567890"
			}
		}
	}
}
```

Response Body Error :

```json
{
	"success": false,
	"message": "Email and password are required.",
	"error": null
}
```

**Error Cases**:

- Missing email or password
- Invalid email format
- Invalid credentials (wrong email or password)
- User not found
- Account disabled or locked
- Credential Already exist

## Authentication Header

After successful login or registration, use the access token in the Authorization header for protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**:

- The token is a JWT (JSON Web Token)
- Token expires after the `expires_in` duration (typically 3600 seconds / 1 hour)
- Use the `refresh_token` to obtain a new access token when it expires
- Include the token in the Authorization header for all protected routes
- Token format: `Bearer <access_token>`
