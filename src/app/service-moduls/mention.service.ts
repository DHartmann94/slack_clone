import { ElementRef, Injectable, Renderer2 } from '@angular/core';
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
  mentionedUserIds:any = [];
  mentionListOpen:boolean = false;

  constructor(
    public userService: UserDataService,
    ) { }

  async getUsers(userData: [], currentUser: string) {
    this.usersInCannel = [];
    for (const userID of userData) {
      const myuser = await this.userService.usersDataBackend(userID);
      this.usersInCannel.push({'user': myuser, 'id': userID});
    }
    this.removeCurrentUser(currentUser);
  }


  removeCurrentUser(currentUser: string) {
    const index = this.usersInCannel.findIndex(user => user.user['name'] === currentUser);
    if (index !== -1) {
      this.usersInCannel.splice(index, 1);
    }
  }

  preventClick(event: MouseEvent) {
    event.stopPropagation();
  }



  /// evtl. reicht das Array mentionMessage -> 
  // TODO -> ID,s übergeben an Message
  updateInputField(user: any) {
    if (!this.mentionInMessage.includes(user)) {
      this.mentionInMessage.push(user);
    } 
    // this.mentionInMessage.forEach((u: { id: any; }) => {
    //   this.mentionedUserIds.push(u.id);
    // });
  }

  deleteMention(index:number) {
    this.mentionInMessage.splice(index, 1);

  }

  resetArray() {
    this.mentionInMessage = [];
  }

  checkForMention(mentionedUser:any[], CUid:string) {
    return mentionedUser.includes(CUid);
  }

  async resolveMentionedUser(id:string) {
    const myuser = await this.userService.usersDataBackend(id);
    
      }

}
