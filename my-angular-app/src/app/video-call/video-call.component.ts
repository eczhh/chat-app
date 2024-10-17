import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import Peer from "peerjs";

@Component({
  selector: "app-video-call",
  templateUrl: "./video-call.component.html",
  styleUrls: ["./video-call.component.css"],
})
export class VideoCallComponent implements OnInit {
  peer!: Peer;
  myPeerId!: string;
  currentCall: any;
  @ViewChild("localVideo") localVideo!: ElementRef;
  @ViewChild("remoteVideo") remoteVideo!: ElementRef;

  ngOnInit(): void {
    // Initialize PeerJS with a random ID
    this.peer = new Peer({
      host: "localhost",
      port: 3001,
      path: "/peerjs",
    });

    this.peer.on("open", (id: string) => {
      this.myPeerId = id;
      console.log("My peer ID is: " + this.myPeerId);
    });

    // Handle incoming calls
    this.peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          this.localVideo.nativeElement.srcObject = stream;
          call.answer(stream); // Answer the call with our stream

          call.on("stream", (remoteStream) => {
            this.remoteVideo.nativeElement.srcObject = remoteStream; // Show the remote video
          });
        });
    });
  }

  // Make a call to the other peer
  makeCall(peerId: string) {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.localVideo.nativeElement.srcObject = stream;
        const call = this.peer.call(peerId, stream);

        call.on("stream", (remoteStream) => {
          this.remoteVideo.nativeElement.srcObject = remoteStream;
        });

        this.currentCall = call;
      });
  }

  // End the call
  endCall() {
    if (this.currentCall) {
      this.currentCall.close();
    }
  }
}
