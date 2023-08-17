import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatBehaviorService {
  private crudTriggeredSubject = new Subject<void>();
  crudTriggered$ = this.crudTriggeredSubject.asObservable();

  ChannelChatIsOpen: boolean = true;

  triggerCRUD() {
    this.crudTriggeredSubject.next();
  }
}
