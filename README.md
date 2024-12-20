# GymBuddy Backend

## Setup Project Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/AjayKumar-bit/GymBuddy-Backend.git
   cd GymBuddy-Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and add your environment variables:

   ```plaintext
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## User Endpoints

### Register User

- **URL:** `/register`
- **Method:** `POST`
- **Description:** Creates a new user account with the provided username, email, and password.
- **Body:**
  ```json
  {
    "username": "example",
    "email": "example@example.com",
    "password": "password123"
  }
  ```

### Login User

- **URL:** `/login`
- **Method:** `POST`
- **Description:** Authenticates a user and returns an access token for subsequent requests.
- **Body:**
  ```json
  {
    "email": "example@example.com",
    "password": "password123"
  }
  ```

### Logout User

- **URL:** `/logout`
- **Method:** `POST`
- **Description:** Invalidates the user's current access token, logging them out.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```

### Update User Profile

- **URL:** `/updateProfile`
- **Method:** `PATCH`
- **Description:** Updates the user's profile information (username and email).
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "username": "newUsername",
    "email": "newEmail@example.com"
  }
  ```

### Delete User

- **URL:** `/deleteUser`
- **Method:** `DELETE`
- **Description:** Deletes the user's account and all associated data (days, exercises, etc.).
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```

### Add Planner Date

- **URL:** `/addPlannerDate`
- **Method:** `POST`
- **Description:** Sets the start date for the user's workout planner, used for tracking exercise routines.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "date": "2023-10-10"
  }
  ```

### Change Password

- **URL:** `/changePassword`
- **Method:** `PATCH`
- **Description:** Updates the user's password after verifying the old password.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "oldPassword": "oldPassword123",
    "newPassword": "newPassword123"
  }
  ```

# Plan Endpoints

### Add Day

- **URL:** `/addDay`
- **Method:** `POST`
- **Description:** Creates a new workout day in the user's planner with a specific description.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "date": "2023-10-10",
    "description": "Leg day"
  }
  ```

### Get Days

- **URL:** `/getDays`
- **Method:** `GET`
- **Description:** Retrieves all workout days from the user's planner, sorted by creation date.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```

### Update Day

- **URL:** `/updateDay`
- **Method:** `PATCH`
- **Description:** Modifies the description of an existing workout day.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "dayId": "dayId123",
    "description": "Updated description"
  }
  ```

### Delete Day

- **URL:** `/deleteDay`
- **Method:** `DELETE`
- **Description:** Removes a workout day and all associated exercises from the planner.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "dayId": "dayId123"
  }
  ```

# Exercise Endpoints

### Add Exercise

- **URL:** `/addExercise`
- **Method:** `POST`
- **Description:** Adds a new exercise to a specific workout day with sets and reps.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "dayId": "dayId123",
    "name": "Squat",
    "sets": 3,
    "reps": 12
  }
  ```

### Get Exercises by Day

- **URL:** `/exercises/:dayId`
- **Method:** `GET`
- **Description:** Retrieves all exercises for a specific workout day.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```

### Delete Exercise

- **URL:** `/deleteExercise`
- **Method:** `DELETE`
- **Description:** Removes a specific exercise from a workout day.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "exerciseId": "exerciseId123"
  }
  ```

### Update Exercise

- **URL:** `/updateExercise`
- **Method:** `PATCH`
- **Description:** Modifies the details of an existing exercise (name, sets, reps).
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
- **Body:**
  ```json
  {
    "exerciseId": "exerciseId123",
    "name": "Updated Exercise Name",
    "sets": 4,
    "reps": 10
  }
  ```

### Get Today's Exercises

- **URL:** `/getTodayExercises`
- **Method:** `GET`
- **Description:** Retrieves all exercises scheduled for the current day based on the planner start date.
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```
