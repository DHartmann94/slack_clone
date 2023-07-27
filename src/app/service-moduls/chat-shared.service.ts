import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatSharedService  {
  private chatCreated: boolean = false;

  setChatCreated(flag: boolean) {
    this.chatCreated = flag;
  }

  getChatCreated() {
    return this.chatCreated;
  }
}
