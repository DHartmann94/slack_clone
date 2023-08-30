import { Injectable } from '@angular/core';
import { UserDataInterface, UserDataService } from './user.service';
import { MessageDataInterface, MessageDataService } from './message.service';
import { ThreadDataInterface } from './thread.service';
import { ChannelDataInterface } from './channel.service';
import { ChatComponent } from '../chat/chat.component';
import { findIndex } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MentionService {
  
  chatPopupOpen = false;
  usersInCannel:any[] = [];
  chatToggledWithButton = true;
  mentionInMessage:any = [];


  constructor(public userService: UserDataService) { }

  async getUsers(userData: [], currentUser: string) {
    this.usersInCannel = [];
    for (const userID of userData) {
      const myuser = await this.userService.usersDataBackend(userID);
      this.usersInCannel.push(myuser);
    }
    this.removeCurrentUser(currentUser);
  }


  removeCurrentUser(currentUser: string) {
    const index = this.usersInCannel.findIndex(user => user['name'] === currentUser);
    if (index !== -1) {
      this.usersInCannel.splice(index, 1);
    }
  }

  preventClick(event: MouseEvent) {
    event.stopPropagation();
  }

  updateInputField(user: any) {
    this.mentionInMessage.push(user);
  }

  deleteMention(index:number) {
    this.mentionInMessage.splice(index, 1);
  }
}
