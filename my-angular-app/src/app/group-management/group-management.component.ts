import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LogoutComponent } from "../logout/logout.component";

@Component({
    selector: 'app-group-management',
    standalone: true,
    templateUrl: './group-management.component.html',
    styleUrls: ['./group-management.component.css'],
    imports: [FormsModule, CommonModule, LogoutComponent]
})
export class GroupManagementComponent {
  groupName: string = '';
  groups: any[] = [];

  // Objects to store inputs for each group
  userInputs: { [key: string]: string } = {};
  channelInputs: { [key: string]: string } = {};

  private apiUrl = 'http://localhost:3000/api/groups';

  constructor(private http: HttpClient) {}

  createGroup(): void {
    this.http.post(this.apiUrl, { groupName: this.groupName }).subscribe((group: any) => {
      this.groups.push(group);
      this.groupName = '';
    });
  }

  addUserToGroup(groupName: string, username: string): void {
    if (!username) return; // Ensure there's a username input
    this.http.post(`${this.apiUrl}/${groupName}/users`, { username }).subscribe(() => {
      this.loadGroups();
      this.userInputs[groupName] = ''; // Clear the input field for this group
    });
  }

  addChannelToGroup(groupName: string, channelName: string): void {
    if (!channelName) return; // Ensure there's a channelName input
    this.http.post(`${this.apiUrl}/${groupName}/channels`, { channelName }).subscribe(() => {
      this.loadGroups();
      this.channelInputs[groupName] = ''; // Clear the input field for this group
    });
  }

  removeUserFromGroup(groupName: string, userId: string): void {
    this.http.delete(`${this.apiUrl}/${groupName}/users/${userId}`).subscribe(() => {
      this.loadGroups();
    });
  }


  removeChannelFromGroup(groupName: string, channelName: string): void {
    this.http.delete(`${this.apiUrl}/${groupName}/channels/${channelName}`).subscribe(() => {
      this.loadGroups();
    });
  }

  deleteGroup(groupName: string): void {
    this.http.delete(`${this.apiUrl}/${groupName}`).subscribe(() => {
      this.loadGroups();
    });
  }

  loadGroups(): void {
    this.http.get(this.apiUrl).subscribe((groups: any) => {
      this.groups = groups;
    });
  }

  ngOnInit(): void {
    this.loadGroups();
  }
}
