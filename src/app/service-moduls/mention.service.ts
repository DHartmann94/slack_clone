import { Injectable } from '@angular/core';
import { UserDataService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class MentionService {

  chatPopupOpen = false;
  usersInCannel: any[] = [];
  chatToggledWithButton = true;
  threadToggledWithButton = true;
  mentionInMessage: any = [];
  mentionedUserIds: any = [];
  mentionListOpen: boolean = false;
  mentionInThread:boolean = false;

  constructor(
    public userService: UserDataService,
  ) { }

  async getUsers(userData: string[], currentUser: string) {
    this.usersInCannel = [];
    for (const userID of userData) {
      const myuser = await this.userService.usersDataBackend(userID);
      const userIndex = this.usersInCannel.findIndex((user) => user.id === userID);
      if (userIndex === -1) {
        this.usersInCannel.push({ 'user': myuser, 'id': userID });
      }
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

  updateInputField(user: any) {
    if (!this.mentionInMessage.includes(user)) {
      this.mentionInMessage.push(user);
    }
  }


  deleteMention(index: number) {
    this.mentionInMessage.splice(index, 1);

  }

  resetArray() {
    this.mentionInMessage = [];
  }

  checkForMention(mentionedUser: any[], CUid: string) {
    return mentionedUser.includes(CUid);
  }

  resolveMentionedUser(id: any) {
    if (id) {
      const user = this.userService.userData.filter(user => user.id.includes(id));
      return user[0].name;
    }
    return undefined;
  }

  resolveForRedDisplay(mentionUsers: any[]) {
    for (const users of mentionUsers) {
      if (users.id.includes(this.userService.currentUser)) {
        return true;
      }

    }
    return false;
  }

}
