import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatBehaviorService {
  private crudTriggeredSubject = new Subject<void>();
  crudTriggered$ = this.crudTriggeredSubject.asObservable();

  private headerViewSubject = new Subject<boolean>();
  headerView$ = this.headerViewSubject.asObservable();

  ChannelChatIsOpen: boolean = true;

  hideChannel: boolean = false;
  hideChat: boolean = true;
  hideDirectChat: boolean = true;
  hideHeader: boolean = true;
  toggleDirectChatIcon: boolean = true;
  toggleSearchBar: boolean = false;
  headerMoblieView: boolean = false;

  isChatOpenResponsive: boolean = true;
  isThreadOpenResponsive: boolean = false;
  isDirectChatToUserOpenResponsive: boolean = false;
  isResponsive: boolean = false;

  triggerChat() {
    this.crudTriggeredSubject.next();
  }
}
