import { Injectable } from '@angular/core';
import { UserDataInterface, UserDataService } from './user.service';
import { MessageDataInterface, MessageDataService } from './message.service';
import { ThreadDataInterface } from './thread.service';
import { ChannelDataInterface } from './channel.service';
import { ChatComponent } from '../chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class MentionService {
  
  chatPopupOpen = false;
  usersInCannel:any[] = [];

  constructor(public userService: UserDataService) { }

  async getUsers(userData: []){
    this.usersInCannel = [];
    userData.forEach(async userID => {
    this.userService.usersDataBackend(userID);
    let myuser = await this.userService.usersDataBackend(userID);
    this.usersInCannel.push(myuser);
    });
  }
}
