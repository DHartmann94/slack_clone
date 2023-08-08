import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserDataInterface } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataResolveService {
  private dataSubjectUsers = new BehaviorSubject<UserDataInterface | null>(null);

  sendDataUsers(data: UserDataInterface | null) {
    this.dataSubjectUsers.next(data);
  }

  resolve(): Observable<UserDataInterface | null> {
    return this.dataSubjectUsers.asObservable();
  }
}
