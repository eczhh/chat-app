# Angular-Node.js Chat System

## Overview

This project is a Chat System built using **Angular** on the frontend and **Node.js** with **MongoDB** on the backend. The system implements role-based authentication, allowing different users (e.g., superadmins, group admins) to access various features based on their roles.

## Git Structure

The repository follows a structured approach to version control:

```
├── backend/                # Node.js backend folder
│   ├── models/             # Mongoose models (User, Group, Message)
│   ├── routes/             # Express API routes for authentication, user, and group management
│   ├── uploads/            # Directory for uploaded images or files
│   ├── .env                # Environment configuration file
│   ├── db.js               # Database connection setup for MongoDB
│   ├── index.js            # Main server setup file
│   └── package.json        # Backend dependencies
├── frontend/               # Angular frontend folder
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Angular components (e.g., login, dashboard)
│   │   │   ├── services/   # Angular services (e.g., AuthService, SocketService)
│   │   │   ├── guards/     # Angular route guards (e.g., AuthGuard)
│   └── angular.json        # Angular configuration
├── README.md               # Project documentation
└── .gitignore              # Ignored files for Git
```

### Git Version Control Strategy

- **Branches**: The repository uses feature branches. For each feature, a new branch is created (e.g., `feature/login-authentication`, `feature/role-management`), and once the feature is stable, it is merged into the `main` branch.
- **Commits**: Each commit follows a descriptive message format to provide clarity (e.g., `Implemented login feature with session management`).

## Data Structure

The application uses **MongoDB** as its database, with collections for users, groups, and messages.

### MongoDB Collections

1. **Users Collection**:
   - Stores user credentials and roles.
   - Fields:
     - `username` (String): Unique identifier for login.
     - `password` (String): Hashed password.
     - `role` (String): Role that determines access privileges (e.g., `superadmin`, `groupadmin`, `user`).

2. **Groups Collection**:
   - Stores information about groups and associated users.
   - Fields:
     - `groupName` (String): Name of the group.
     - `users` (Array of ObjectIds): References to user documents.
     - `channels` (Array of Strings): List of channels associated with the group.

3. **Messages Collection**:
   - Stores chat messages.
   - Fields:
     - `sender` (ObjectId): Reference to the sender's user document.
     - `content` (String): Message content.
     - `timestamp` (Date): Time when the message was sent.
     - `group` (ObjectId): Reference to the group where the message was sent.

## REST API

The Angular frontend communicates with the Node.js backend using a REST API. Below is a description of the available routes:

### 1. **POST /api/login**
- **Description**: Authenticates a user based on their credentials.
- **Parameters**:
  - `username`: The username provided by the user.
  - `password`: The password provided by the user.
- **Response**:
  - On success: Returns `{ message: 'Login successful', user: { username, role } }`.
  - On failure: Returns `{ message: 'Invalid credentials' }`.

### 2. **POST /api/users**
- **Description**: Creates a new user in the MongoDB database.
- **Request Body**:
  - `username`: Username for the new user.
  - `password`: Password for the new user.
  - `role`: Role of the new user (`superadmin`, `groupadmin`, etc.).
- **Response**: Returns the newly created user document or an error if the user already exists.

### 3. **GET /api/users**
- **Description**: Retrieves all users.
- **Response**: Returns an array of all user documents.

### 4. **POST /api/groups**
- **Description**: Creates a new group in MongoDB.
- **Request Body**:
  - `groupName`: Name of the new group.
- **Response**: Returns the newly created group or an error if the group already exists.

### 5. **POST /api/groups/:groupName/users**
- **Description**: Adds a user to a specified group.
- **Request Body**:
  - `username`: The username to add to the group.
- **Response**: Returns the updated group document.

## Angular Architecture

### Components

1. **LoginComponent**: Handles user login and redirects based on user roles.
   - **Template**: `login.component.html`
   - **Style**: `login.component.css`
   
2. **DashboardComponent**: Default dashboard for regular users.
   - **Template**: `dashboard.component.html`
   
3. **UserManagementComponent**: Allows `superadmin` to manage users (view, add, delete).
   - **Template**: `user-management.component.html`
   
4. **GroupManagementComponent**: Allows `groupadmin` to manage groups and channels.
   - **Template**: `group-management.component.html`

### Services

1. **AuthService**: Handles login, logout, and session management. It communicates with the backend for authentication and stores user session in `localStorage`.
2. **SocketService**: Establishes and maintains socket connections for real-time messaging.
3. **APIService**: Facilitates communication with backend APIs for CRUD operations on users, groups, and messages.

### Guards

1. **AuthGuard**: Protects routes and ensures that users are logged in before accessing certain routes (e.g., `/dashboard`, `/user-management`).
   - Checks if the user is authenticated based on `localStorage` and redirects to the login page if not authenticated.

## Setup

### Backend

1. Navigate to the `backend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up MongoDB connection in the `.env` file:
   ```env
   PORT=5000
   DB_URL=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_jwt_secret
   ```
4. Start the Node.js server:
   ```bash
   node index.js
   ```

### Frontend

1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular app:
   ```bash
   ng serve
   ```

## Usage

- **Login** as different users (e.g., `super` with password `123`) and navigate based on your role.
- **Superadmin** will be redirected to the **User Management** page.
- **Group admin** will be redirected to the **Group Management** page.
- **Regular users** will be redirected to the **Dashboard**.
