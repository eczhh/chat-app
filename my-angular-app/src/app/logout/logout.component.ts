import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-logout",
  standalone: true,
  template: `<button class="btn btn-danger" (click)="logout()">Logout</button>`,
  imports: [CommonModule],
})
export class LogoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout(); // Clear session and user data
    this.router.navigate(["/login"]); // Redirect to login page
  }
}
