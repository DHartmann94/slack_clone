import { Injectable } from '@angular/core';
import { Firestore, collection, query, addDoc, onSnapshot, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataInterface } from './user.service';
import { MessageDataInterface } from './message.service';

export interface DirectMessageInterface {
  id?: any;
  messages?: MessageDataInterface[]; 
  users?: UserDataInterface[];
}

@Injectable({
  providedIn: 'root'
})

export class DirectMessageService {
  private directMessageDataSubject: BehaviorSubject<DirectMessageInterface[]> = new BehaviorSubject<DirectMessageInterface[]>([]);
  public directMessageData$: Observable<DirectMessageInterface[]> = this.directMessageDataSubject.asObservable();

  constructor(
    public firestore: Firestore
  ) { }

  getDirectChatData(): Observable<DirectMessageInterface[]> {
    const directMessageCollection = collection(this.firestore, 'directMessage');
    const q = query(directMessageCollection);

    return new Observable<DirectMessageInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storedDirectMessageData: DirectMessageInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { users, messages } = data;
          const directMessage: DirectMessageInterface = {
            id: doc.id,
            users: users,
            messages: messages
          };
          storedDirectMessageData.push(directMessage);
        });

        this.directMessageDataSubject.next(storedDirectMessageData);
        observer.next(storedDirectMessageData);
      });

      return () => unsubscribe();
    });
  }

  addUserToDirectMessage(user: UserDataInterface): Observable<string> {
    const directMessageCollection = collection(this.firestore, 'directMessage');
    const newDirectMessage: DirectMessageInterface = {
      users: [user], 
    };

    return from(addDoc(directMessageCollection, newDirectMessage)).pipe(
      map((docRef) => {
        return docRef.id;
      })
    );
  }
}
