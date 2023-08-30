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

  triggerChat() {
    this.crudTriggeredSubject.next();
  }

  toggleHeaderView(show: boolean) {
    this.headerViewSubject.next(show);
  }
}
