import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";

@Component({
  selector: "app-login",
  standalone: true,
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  imports: [FormsModule, CommonModule, HttpClientModule],
})
export class LoginComponent {
  username: string = "";
  password: string = "";
  loginFailed: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login(this.username, this.password).subscribe(
      (success) => {
        if (success) {
          const role = this.authService.getRole(); // Get role from localStorage

          if (role === "superadmin") {
            this.router.navigate(["/user-management"]); // Redirect superadmin to user management
          } else if (role === "groupadmin") {
            this.router.navigate(["/group-management"]); // Redirect groupadmin to group management
          } else {
            this.router.navigate(["/dashboard"]); // Default redirect for other users
          }
        } else {
          this.loginFailed = true; // Show error if login failed
        }
      },
      (error) => {
        this.loginFailed = true; // Show error on login failure
      }
    );
  }
}
