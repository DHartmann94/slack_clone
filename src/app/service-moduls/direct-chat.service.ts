import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';

export interface DirectChatInterface {
  id?: any;
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: string;
  sentBy?: string;
  sentById?: string,
  mentionedUser?: string;
  senderName?: string;
}

@Injectable({
  providedIn: 'root'
})

export class DirectChatService {
  private messageDataSubject: BehaviorSubject<DirectChatInterface[]> = new BehaviorSubject<DirectChatInterface[]>([]);
  public messageData$: Observable<DirectChatInterface[]> = this.messageDataSubject.asObservable();

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

        this.messageDataSubject.next(storedDirectMessageData);
        observer.next(storedDirectMessageData);
      });

      return () => unsubscribe();
    });
  }
}
