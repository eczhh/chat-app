import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GroupManagementService {
  private groups: { name: string, channels: string[], users: string[] }[] = [];

  createGroup(groupName: string): void {
    this.groups.push({ name: groupName, channels: [], users: [] });
  }

  addUserToGroup(groupName: string, username: string): void {
    const group = this.groups.find(g => g.name === groupName);
    if (group && !group.users.includes(username)) {
      group.users.push(username);
    }
  }

  addChannelToGroup(groupName: string, channelName: string): void {
    const group = this.groups.find(g => g.name === groupName);
    if (group && !group.channels.includes(channelName)) {
      group.channels.push(channelName);
    }
  }

  removeGroup(groupName: string): void {
    this.groups = this.groups.filter(g => g.name !== groupName);
  }
}
