# Angular-Node.js Chat System

## Overview

This project is a Chat System built using **Angular** on the frontend and **Node.js** on the backend. The system implements role-based authentication, allowing different users (e.g., admin, group admins) to access different parts of the system.

## Git Structure

The repository follows a structured approach to version control:

```
├── backend/                # Node.js backend folder
│   ├── data/               # JSON files for users and groups
│   ├── index.js            # Main Node.js server file
│   └── package.json        # Backend dependencies
├── frontend/               # Angular frontend folder
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Angular components (e.g., login, dashboard)
│   │   │   ├── services/   # Angular services (e.g., AuthService)
│   │   │   ├── guards/     # AuthGuard implementation
│   └── assets/             # Static files (e.g., CSS)
├── README.md               # Project documentation
└── .gitignore              # Ignored files for Git
```

### Git Version Control Strategy

- **Branches**: The repository uses feature branches. For each feature, a new branch is created (e.g., `feature/login-authentication`, `feature/role-management`), and once the feature is stable, it is merged into the `main` branch.
- **Commits**: Each commit follows a descriptive message format to provide clarity (e.g., `Implemented login feature with session management`).

## Data Structure

The main data structure used in the project is **JSON** for storing user and group data.

### Users Data (in `users.json`):

```json
[
  {
    "username": "super",
    "password": "123",
    "role": "superadmin"
  },
  {
    "username": "groupadmin",
    "password": "password",
    "role": "groupadmin"
  },
  {
    "username": "john_doe",
    "password": "john123",
    "role": "user"
  }
]
```

- Each user has:
  - `username`: Unique identifier for login.
  - `password`: Plain-text password for login.
  - `role`: Role that determines access privileges (e.g., `superadmin`, `groupadmin`, `user`).

### Groups Data (in `groups.json`):

```json
[
  {
    "groupName": "Admins",
    "users": ["super", "groupadmin"],
    "channels": ["General", "Admin Discussions"]
  }
]
```

- `groupName`: Name of the group.
- `users`: Array of usernames belonging to the group.
- `channels`: Array of channels available to the group.

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
- **Description**: Creates a new user in the system.
- **Request Body**:
  - `username`: Username for the new user.
  - `password`: Password for the new user.
  - `role`: Role of the new user (`admin`, `groupadmin`, etc.).
- **Response**: Returns the newly created user object or an error message if the user already exists.

### 3. **GET /api/users**
- **Description**: Retrieves all users.
- **Response**: Returns an array of all user objects.

### 4. **POST /api/groups**
- **Description**: Creates a new group.
- **Request Body**:
  - `groupName`: Name of the new group.
- **Response**: Returns the newly created group or an error message if the group already exists.

### 5. **POST /api/groups/:groupName/users**
- **Description**: Adds a user to a group.
- **Request Body**:
  - `username`: The username to add to the group.
- **Response**: Returns the updated group.

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

2. **GroupService**: (optional): Handles the logic for adding/removing users to/from groups and managing channels.

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
3. Start the Node.js server:
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
- **Regular users** will be redirected to the **Dashboard**.# chat-app
# chat-app
