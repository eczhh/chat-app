import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"; // Import HttpClient
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:3000/api"; // Backend API URL

  constructor(private http: HttpClient) {} // Inject HttpClient

  login(username: string, password: string): Observable<any> {
    return this.http
      .post<{ message: string; token: string; user: any }>(`${this.apiUrl}/login`, {
        username,
        password,
      })
      .pipe(
        map((response) => {
          if (response && response.user && response.token) {
            localStorage.setItem("token", response.token); // Store the token
            localStorage.setItem("loggedInUser", response.user.username);
            localStorage.setItem("userRole", response.user.role);
            return response; // Return the full response with token
          } else {
            return null;
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("loggedInUser");
  }

  getLoggedInUser(): string | null {
    return localStorage.getItem("loggedInUser");
  }

  getRole(): string | null {
    return localStorage.getItem("userRole");
  }
}
