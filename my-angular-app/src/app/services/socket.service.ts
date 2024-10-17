// socket.service.ts
import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  constructor(private socket: Socket) {}

  // Set token after login
  setToken(token: string): void {
    this.socket.ioSocket.io.opts.query = { token };
    this.socket.connect();
  }

  // Send a structured message
  public sendMessage(message: {
    sender: string;
    receiver: string;
    content: string;
  }): void {
    this.socket.emit("chat message", message);
  }

  // Receive messages
  public getMessages(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on("chat message", (data: any) => observer.next(data));
    });
  }

  // Get online users
  public getOnlineUsers(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on("user connected", (users: any) => observer.next(users));
    });
  }

  // Method to send peer ID to server
  public sendPeerId(username: string, peerId: string): void {
    this.socket.emit("peer-id", { username, peerId });
  }

  // Method to get peer IDs from server
  public getPeerIds(): Observable<{ [username: string]: string }> {
    return new Observable((observer) => {
      this.socket.on("peer-ids", (data: { [username: string]: string }) =>
        observer.next(data)
      );
    });
  }

  // Disconnect socket
  public disconnect(): void {
    this.socket.disconnect();
  }
}
