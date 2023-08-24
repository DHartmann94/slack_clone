import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageProfileToDirectMessageService {
  private isDirectMessageOpen = new BehaviorSubject<boolean>(false);


  openDirectMessage() {
    this.isDirectMessageOpen.next(true);
  }

  closeDirectMessage() {
    this.isDirectMessageOpen.next(false);
  }

  isDirectMessageOpen$() {
    return this.isDirectMessageOpen.asObservable();
  }


  constructor() { }
}
