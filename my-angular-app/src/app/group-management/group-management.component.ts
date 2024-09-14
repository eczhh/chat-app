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
  username: string = '';
  channelName: string = '';
  groups: any[] = [];

  private apiUrl = 'http://localhost:3000/api/groups';

  constructor(private http: HttpClient) {}

  createGroup(): void {
    this.http.post(this.apiUrl, { groupName: this.groupName }).subscribe((group: any) => {
      this.groups.push(group);
      this.groupName = '';
    });
  }

  addUserToGroup(groupName: string, username: string): void {
    this.http.post(`${this.apiUrl}/${groupName}/users`, { username }).subscribe(() => {
      this.loadGroups();
    });
  }

  addChannelToGroup(groupName: string, channelName: string): void {
    this.http.post(`${this.apiUrl}/${groupName}/channels`, { channelName }).subscribe(() => {
      this.loadGroups();
    });
  }

  removeUserFromGroup(groupName: string, username: string): void {
    this.http.delete(`${this.apiUrl}/${groupName}/users/${username}`).subscribe(() => {
      this.loadGroups();
    });
  }

  removeChannelFromGroup(groupName: string, channelName: string): void {
    this.http.delete(`${this.apiUrl}/${groupName}/channels/${channelName}`).subscribe(() => {
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
