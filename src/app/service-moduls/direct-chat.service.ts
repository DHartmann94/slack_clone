import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataInterface } from './user.service';
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
  public directChatData$: Observable<DirectChatInterface[]> = this.directChatDataSubject.asObservable();

  constructor(
    public firestore: Firestore
  ) { }

  getDirectChatData(): Observable<DirectChatInterface[]> {
    const directChatCollection = collection(this.firestore, 'directchat');
    const q = query(directChatCollection);

    return new Observable<DirectChatInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storedDirectChatData: DirectChatInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { users, messages } = data;
          const directChat: DirectChatInterface = {
            id: doc.id,
            users: users,
            messages: messages
          };
          storedDirectChatData.push(directChat);
        });

        this.directChatDataSubject.next(storedDirectChatData);
        observer.next(storedDirectChatData);
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
