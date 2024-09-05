POST /users/register
400 Bad Request
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "username": "Username must be at least 6 characters long",
    "email": "Invalid email format",
    "firstName": "First name must be at least 2 characters long"
    "lastName": "Last name must be at least 2 characters long",
    "password": "Password must be at least 6 characters long"
  }
}

POST /user/register
409 Conflict
{
  "status": "error",
  "message": "Email already exists"
}


POST /user/register
201 Created
{
  "status": "success",
  "message": "User registered successfully"
}

POST /users/register
500 Internal Server Error
{
  "status": "error",
  "message": "An error occurred while saving the user"
}

POST /users/login
400 Bad Request
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters long"
  }
}

POST /users/login
401 Unauthorized
{
  "status": "error",
  "message": {
    "Invalid credentials",
    "Invalid or expired token"
  }
}

POST /users/login
200 OK
{
  "status": "success",
  "message": {
    "Login successful",
    "Password updated successfully"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
