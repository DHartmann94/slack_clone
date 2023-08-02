import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataInterface } from './user-data.service';
import { MessageDataInterface } from './message.service';

export interface DirectChatInterface {
  id?: any;
  messages?: MessageDataInterface[]; 
  users?: UserDataInterface[];
}

@Injectable({
  providedIn: 'root'
})

export class DirectChatService {
  private directChatDataSubject: BehaviorSubject<DirectChatInterface[]> = new BehaviorSubject<DirectChatInterface[]>([]);
  public directChateData$: Observable<DirectChatInterface[]> = this.directChatDataSubject.asObservable();

  constructor(public firestore: Firestore) { }

  getDirectChatData(): Observable<DirectChatInterface[]> {
    const directChatCollection = collection(this.firestore, 'directchat');
    const q = query(directChatCollection);

    return new Observable<DirectChatInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storedDirectMessageData: DirectChatInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { users, messages } = data;
          const directMessage: DirectChatInterface = {
            id: doc.id,
            users: users,
            messages: messages
          };
          storedDirectMessageData.push(directMessage);
        });

        this.directChatDataSubject.next(storedDirectMessageData);
        observer.next(storedDirectMessageData);
      });

      return () => unsubscribe();
    });
  }

  addUserToDirectChat(user: UserDataInterface): Observable<string> {
    const directChatCollection = collection(this.firestore, 'directchat');
    const newDirectChat: DirectChatInterface = {
      users: [user], 
    };

    return from(addDoc(directChatCollection, newDirectChat)).pipe(
      map((docRef) => {
        return docRef.id;
      })
    );
  }
}
