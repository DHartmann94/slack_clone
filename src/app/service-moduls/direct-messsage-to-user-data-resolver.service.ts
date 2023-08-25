import { Injectable } from '@angular/core';
import { UserDataInterface } from './user.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageToUserDataResolverService {
  private openDirectMessageToUserSubject = new Subject<UserDataInterface>();

  openDirectMessageToUserObservable$ = this.openDirectMessageToUserSubject.asObservable();

  openDirectChatUserId(user: UserDataInterface) {
    this.openDirectMessageToUserSubject.next(user);
  }
}
