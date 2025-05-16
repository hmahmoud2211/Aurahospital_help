# Backend Documentation (FastAPI)

## Folder Structure

backend/
├── auth.py           # Authentication and password reset endpoints
├── main.py           # FastAPI app entry point, includes routers and DB config
├── models.py         # Database models (Patient, Practitioner, etc.)
├── requirements.txt  # Python dependencies
├── db.sqlite3        # SQLite database file
├── __init__.py       # Package marker
├── routers/          # (Optional) Additional API routers
└── __pycache__/      # Python cache files (ignore)

## FastAPI Pipeline Overview

1. **main.py**
   - Initializes FastAPI app
   - Sets up CORS (for frontend communication)
   - Registers routers (e.g., auth)
   - Configures Tortoise ORM for SQLite
   - Runs the app (usually with `uvicorn`)

2. **auth.py**
   - Handles registration, login, password reset, and email verification
   - Uses JWT for authentication
   - Sends emails via SMTP (Gmail)
   - Passwords are hashed with bcrypt

3. **models.py**
   - Defines Patient and Practitioner models
   - Stores user info, email, phone, password hash, etc.

## How to Run the Backend

1. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```sh
   uvicorn backend.main:app --reload --port 8000
   ```
   or if you have a run.py:
   ```sh
   python run.py
   ```

3. **Access Swagger UI:**
   - Open your browser and go to: [http://localhost:8000/docs](http://localhost:8000/docs)

## How to Test in Swagger UI

1. **Go to [http://localhost:8000/docs](http://localhost:8000/docs)**
2. You will see all available endpoints grouped by tags (e.g., `auth`).
3. Click on an endpoint to expand it and see details.
4. Click "Try it out" to enter parameters and test the endpoint.

### Example: Test Password Reset Flow

1. **Register a user** (`POST /auth/register`)
   - Fill in user data (email, password, etc.)
   - Click Execute

2. **Send Reset Code** (`POST /auth/send-reset-code`)
   - Enter the registered email and mobile number
   - Click Execute (check your email for the code)

3. **Verify Reset Code** (`POST /auth/verify-reset-code`)
   - Enter email, mobile number, and the code you received
   - Click Execute (should return success)

4. **Reset Password** (`POST /auth/reset-password`)
   - Enter email, mobile number, and new password
   - Click Execute (should return success)

5. **Login** (`POST /auth/token`)
   - Enter email and new password
   - Click Execute (should return a JWT token)

## Notes
- All endpoints return JSON responses.
- If you get errors, check the server logs for details.
- For email features, make sure your SMTP credentials are correct in `auth.py`.

---
This file documents the backend folder, pipeline, and how to test the API using Swagger UI. 