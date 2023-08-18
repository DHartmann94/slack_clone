import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserDataInterface } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DirectChatDataResolverService {
  private selectedUserSubject = new BehaviorSubject<UserDataInterface | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  setSelectedUser(user: UserDataInterface) {
    this.selectedUserSubject.next(user);
  }

}
