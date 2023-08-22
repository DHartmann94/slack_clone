import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DirectMessageInterface } from './direct-message.service';

@Injectable({
  providedIn: 'root'
})
export class DirectChatDataResolverService {
  private selectedDirectChatSubject = new BehaviorSubject<DirectMessageInterface | null>(null);

  sendDataDirectChat(data: DirectMessageInterface) {
    this.selectedDirectChatSubject.next(data);
  }

  resolve(): Observable<DirectMessageInterface | null> {
    return this.selectedDirectChatSubject.asObservable();
  }

}
