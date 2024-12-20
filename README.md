# GymBuddy Backend

## Setup Project Locally

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/GymBuddy-Backend.git
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
- **Headers:**
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```

### Update User Profile
- **URL:** `/updateProfile`
- **Method:** `PATCH`
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
- **Headers:**
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```

### Add Planner Date
- **URL:** `/addPlannerDate`
- **Method:** `POST`
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

## Plan Endpoints

### Add Day
- **URL:** `/addDay`
- **Method:** `POST`
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
- **Headers:**
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```

### Update Day
- **URL:** `/updateDay`
- **Method:** `PATCH`
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

## Exercise Endpoints

### Add Exercise
- **URL:** `/addExercise`
- **Method:** `POST`
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
- **Headers:**
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```

### Delete Exercise
- **URL:** `/deleteExercise`
- **Method:** `DELETE`
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
- **Headers:**
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```