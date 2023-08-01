import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataInterface } from './user-data.service';

export interface DirectChatInterface {
  id?: any;
  messageText?: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: string;
  sentBy?: string;
  sentById?: string,
  mentionedUser?: string;
  senderName?: string;
  users?: UserDataInterface[];
}

@Injectable({
  providedIn: 'root'
})

export class DirectChatService {
  private directMessageDataSubject: BehaviorSubject<DirectChatInterface[]> = new BehaviorSubject<DirectChatInterface[]>([]);
  public messageData$: Observable<DirectChatInterface[]> = this.directMessageDataSubject.asObservable();

  constructor(public firestore: Firestore) { }

  getDirectMessages(): Observable<DirectChatInterface[]> {
    const directchat = collection(this.firestore, 'directchat');
    const q = query(directchat);

    return new Observable<DirectChatInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storedDirectMessageData: DirectChatInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { messageText, time, thread, emojis, sentBy, sentById, channel, mentionedUser } = data;
          const directMessage: DirectChatInterface = {
            id: doc.id,
            messageText: messageText,
            time: time,
            thread: thread,
            emojis: emojis,
            channel: channel,
            sentBy: sentBy,
            sentById: sentById,
            mentionedUser: mentionedUser,
          };
          storedDirectMessageData.push(directMessage);
        });

        this.directMessageDataSubject.next(storedDirectMessageData);
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

  subscribeToDirectMessageUpdates() {
    const directchat = collection(this.firestore, 'messages');
    const q = query(directchat);

    onSnapshot(q, (querySnapshot) => {
      const updatedDirectMessageData: DirectChatInterface[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const { id, messageText, time, thread, emojis, sentBy, channel, mentionedUser } = data;
        const directMessage: DirectChatInterface = {
          id: id,
          messageText: messageText,
          time: time,
          thread: thread,
          emojis: emojis,
          sentBy: sentBy,
          channel: channel,
          mentionedUser: mentionedUser,
        };
        updatedDirectMessageData.push(directMessage);
      });

      this.directMessageDataSubject.next(updatedDirectMessageData);
    });
  }
}
