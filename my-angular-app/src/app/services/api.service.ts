import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface Message {
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}



@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = 'http://localhost:3000/api'; // Adjust as needed

  constructor(private http: HttpClient) {}

  // Fetch message history between current user and another user
  getMessageHistory(withUsername: string): Observable<Message[]> {
    const currentUsername = localStorage.getItem('loggedInUser'); // Get the current user from localStorage

    if (!currentUsername) {
      // Handle the case where currentUsername is null or undefined
      console.error("No loggedInUser found in localStorage.");
      return throwError("No loggedInUser found.");
    }

    return this.http.get<Message[]>(`${this.API_URL}/messages/${withUsername}`, {
      params: { currentUsername: currentUsername },
    });
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/users`);
  }

  uploadFile(fileData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/upload`, fileData);
  }



  // Other API methods (login, get users, etc.) can be added here
}
