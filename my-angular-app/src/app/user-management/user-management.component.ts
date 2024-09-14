import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { LogoutComponent } from "../logout/logout.component";

@Component({
  selector: "app-user-management",
  standalone: true,
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.css"],
  imports: [FormsModule, CommonModule, LogoutComponent],
})
export class UserManagementComponent {
  username: string = "";
  email: string = "";
  password: string = "";
  users: any[] = [];
  userExists: boolean = false;

  private apiUrl = "http://localhost:3000/api/users";

  constructor(private http: HttpClient) {}

  // Fetch users from the backend
  loadUsers(): void {
    this.http.get<any[]>(this.apiUrl).subscribe((data) => {
      this.users = data; // Populate the users array with the data from the backend
    });
  }

  // Add a new user
  addUser(): void {
    const newUser = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: "User", // Default role is "User"
    };

    this.http.post(this.apiUrl, newUser).subscribe({
      next: (user) => {
        this.users.push(user); // Add the new user to the local users array
        this.username = "";
        this.email = "";
        this.password = ""; // Clear password after submission
        this.userExists = false;
      },
      error: (err) => {
        if (err.status === 400) {
          this.userExists = true; // Show error if user already exists
        }
      },
    });
  }

  // Remove a user
  removeUser(username: string): void {
    this.http.delete(`${this.apiUrl}/${username}`).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.username !== username); // Update the users list locally
        console.log(`User ${username} removed successfully`);
      },
      error: (err) => {
        console.error(`Error removing user: ${err}`);
      },
    });
  }

  // Promote a user to Group Admin
  promoteUser(username: string): void {
    this.http.put(`${this.apiUrl}/${username}/promote`, {}).subscribe({
      next: (user) => {
        const updatedUser = this.users.find((u) => u.username === username);
        if (updatedUser) {
          updatedUser.role = "groupadmin";
        }
      },
      error: (err) => {
        console.error("Error promoting user:", err);
      },
    });
  }

  // Demote a user to regular User
  demoteUser(username: string): void {
    this.http.put(`${this.apiUrl}/${username}/demote`, {}).subscribe({
      next: (user) => {
        const updatedUser = this.users.find((u) => u.username === username);
        if (updatedUser) {
          updatedUser.role = "User";
        }
      },
      error: (err) => {
        console.error("Error demoting user:", err);
      },
    });
  }

  ngOnInit(): void {
    this.loadUsers(); // Load users when the component is initialized
  }
}
