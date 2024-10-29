import {
  Component,
  OnInit,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ApiService, Message } from "../services/api.service";
import { SocketService } from "../services/socket.service";
import { HttpClientModule } from "@angular/common/http";
import Peer from "peerjs";

interface User {
  username: string;
  profileImage: string;
  lastMessage: string;
  time: string;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  imports: [FormsModule, CommonModule, HttpClientModule],
})
export class DashboardComponent implements OnInit, AfterViewChecked {
  onlineUsers: User[] = []; // Online users fetched dynamically
  users: User[] = []; // All users fetched from API

  messages: { [username: string]: Message[] } = {};
  messageContent: string = "";
  selectedUser!: User;
  currentUser: User | null = null;

  @ViewChild("chatMessages") private chatMessagesContainer!: ElementRef;
  @ViewChild("localVideo") localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild("remoteVideo") remoteVideo!: ElementRef<HTMLVideoElement>;

  peer!: Peer;
  myPeerId!: string;
  currentCall: any;
  peerIds: { [username: string]: string } = {};

  constructor(
    private apiService: ApiService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      this.currentUser = {
        username: loggedInUser,
        profileImage:
          "https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg", // Default profile image
        lastMessage: "",
        time: "",
      };
    } else {
      console.error("No user logged in");
      return;
    }

    // Initialize PeerJS
    this.peer = new Peer({
      host: "localhost",
      port: 3001,
      path: "/peerjs",
    });

    this.peer.on("open", (id: string) => {
      this.myPeerId = id;
      console.log("My peer ID is:", this.myPeerId);

      // Emit the peer ID to the server
      this.socketService.sendPeerId(this.currentUser!.username, this.myPeerId);
    });

    // Handle incoming calls
    this.peer.on("call", (call) => {
      // Prompt the user to accept or reject the call
      const acceptCall = confirm(
        "Incoming video call from " +
          call.metadata.username +
          ". Do you want to accept?"
      );
      if (acceptCall) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            // **Set currentCall before accessing video elements**
            this.currentCall = call;

            // **Wait for the view to update before accessing ViewChild elements**
            setTimeout(() => {
              if (this.localVideo && this.localVideo.nativeElement) {
                this.localVideo.nativeElement.srcObject = stream;
              } else {
                console.error("localVideo is undefined");
              }
            }, 0);

            call.answer(stream); // Answer the call with our stream

            call.on("stream", (remoteStream) => {
              this.remoteVideo.nativeElement.srcObject = remoteStream; // Show the remote video
            });

            call.on("close", () => {
              this.endCall();
            });
          })
          .catch((err) => {
            console.error("Failed to get local stream", err);
            alert("Could not access your camera and microphone on peer.");
          });
      } else {
        call.close();
      }
    });

    this.socketService.getPeerIds().subscribe(
      (peerIds) => {
        this.peerIds = peerIds;
        console.log("Received peer IDs:", this.peerIds);
      },
      (error) => {
        console.error("Error receiving peer IDs:", error);
      }
    );

    // Fetch all users
    this.apiService.getAllUsers().subscribe(
      (users: User[]) => {
        this.users = users; // Set the fetched users to the users array
        console.log("Fetched users:", this.users);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );

    // Subscribe to the list of online users
    this.socketService.getOnlineUsers().subscribe(
      (users: User[]) => {
        this.onlineUsers = users;
        if (this.onlineUsers.length > 0) {
          this.selectUser(this.onlineUsers[0]);
        } else {
          console.error("No online users available.");
        }
      },
      (error) => {
        console.error("Error fetching online users:", error);
      }
    );

    // Subscribe to incoming messages
    this.socketService.getMessages().subscribe(
      (data: any) => {
        this.processIncomingMessage(data);
      },
      (error) => {
        console.error("Socket error:", error);
      }
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const chatContainer = this.chatMessagesContainer.nativeElement;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (err) {
      console.error("Scroll to bottom failed:", err);
    }
  }

  sendMessage() {
    if (this.messageContent.trim() !== "" && this.selectedUser) {
      const newMessage: Message = {
        sender: this.currentUser!.username,
        receiver: this.selectedUser.username,
        content: this.messageContent,
        timestamp: new Date().toISOString(),
      };

      // Initialize messages array if necessary
      if (!this.messages[this.selectedUser.username]) {
        this.messages[this.selectedUser.username] = [];
      }

      // Add the message to the conversation with the selected user
      this.messages[this.selectedUser.username].push({
        sender: this.currentUser!.username,
        receiver: this.selectedUser.username,
        content: this.messageContent,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Update last message and time
      this.selectedUser.lastMessage = this.messageContent;
      this.selectedUser.time = new Date().toLocaleTimeString();

      // Send the message via Socket.io
      this.socketService.sendMessage({
        sender: this.currentUser!.username,
        receiver: this.selectedUser.username,
        content: this.messageContent,
      });

      // Clear the input field
      this.messageContent = "";

      // After sending a message, scroll to bottom
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }

  processIncomingMessage(data: any) {
    const sender = data.sender;
    const newMessage: Message = {
      sender,
      receiver: this.currentUser!.username,
      content: data.content,
      timestamp: new Date(data.time).toLocaleTimeString(),
    };

    // Initialize messages array if necessary
    if (!this.messages[sender]) {
      this.messages[sender] = [];
    }

    // Add the message to the appropriate user
    this.messages[sender].push(newMessage);

    // If the message is from the selected user, scroll to bottom
    if (sender === this.selectedUser?.username) {
      // Use NgZone to ensure change detection runs before scrolling
      this.ngZone.run(() => {
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      });
    } else {
      // Optionally handle messages from other users (e.g., notifications)
      const user = this.onlineUsers.find((u) => u.username === sender);
      if (user) {
        user.lastMessage = data.content;
        user.time = new Date(data.time).toLocaleTimeString();
      }
    }

    // Trigger change detection
    this.cdr.detectChanges();
  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    this.apiService.uploadFile(formData).subscribe(
      (response) => {
        // Send the file URL as a message
        this.messageContent = response.fileUrl;
        this.sendMessage();
      },
      (error) => {
        console.error("File upload failed:", error);
      }
    );
  }

  isFileMessage(content: string): boolean {
    return content.startsWith("http://localhost:3000/uploads/");
  }


  isImageFile(content: string): boolean {
    return content.match(/\.(jpeg|jpg|gif|png)$/) != null;
  }

  isVideoFile(content: string): boolean {
    return content.match(/\.(mp4|webm|ogg)$/) != null;
  }

  selectUser(user: User) {
    this.selectedUser = user;

    // Initialize the messages array if it doesn't exist
    if (!this.messages[user.username]) {
      this.messages[user.username] = [];
    }

    // Fetch message history for the selected user
    this.apiService.getMessageHistory(user.username).subscribe(
      (msgs) => {
        // Map and format messages
        this.messages[user.username] = msgs.map((msg) => ({
          sender: msg.sender,
          receiver: msg.receiver,
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
        }));

        console.log(
          `Message history for ${user.username}:`,
          this.messages[user.username]
        );

        // After loading messages, scroll to bottom
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      },
      (err) => {
        console.error("Error fetching message history:", err);
      }
    );
  }

  endCall() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;

      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        this.localVideo.nativeElement.srcObject = null;
      }

      this.remoteVideo.nativeElement.srcObject = null;
    }
  }

  startVideoCall() {
    if (this.selectedUser) {
      const selectedUserPeerId = this.peerIds[this.selectedUser.username];
      if (selectedUserPeerId) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            // Initiate the call
            const call = this.peer.call(selectedUserPeerId, stream, {
              metadata: { username: this.currentUser!.username },
            });

            // Set up event listeners for the call
            call.on("stream", (remoteStream) => {
              this.remoteVideo.nativeElement.srcObject = remoteStream;
            });

            call.on("close", () => {
              this.endCall();
            });

            // **Set currentCall before accessing video elements**
            this.currentCall = call;

            // **Wait for the view to update before accessing ViewChild elements**
            setTimeout(() => {
              if (this.localVideo && this.localVideo.nativeElement) {
                this.localVideo.nativeElement.srcObject = stream;
              } else {
                console.error("localVideo is undefined");
              }
            }, 0);
          })
          .catch((err) => {
            console.error("Failed to get local stream", err);
            alert("Could not access your camera and microphone.");
          });
      } else {
        alert("User is not available for a video call.");
      }
    }
  }
}
