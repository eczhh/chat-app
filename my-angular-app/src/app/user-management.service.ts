import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private users: { username: string, email: string, password: string }[] = [];

  addUser(username: string, email: string, password: string): boolean {
    if (this.users.some(user => user.username === username)) {
      return false; // Username already exists
    }
    this.users.push({ username, email, password });
    return true;
  }

  removeUser(username: string): void {
    this.users = this.users.filter(user => user.username !== username);
  }

  getUsers(): { username: string, email: string }[] {
    return this.users;
  }
}
