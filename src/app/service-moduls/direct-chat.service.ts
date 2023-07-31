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
    const messages = collection(this.firestore, 'messages');
    const q = query(messages);

    return new Observable<DirectChatInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storedMessageData: DirectChatInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          const { messageText, time, thread, emojis, sentBy, sentById, channel, mentionedUser } =
            data;
          const message: DirectChatInterface = {
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
          storedMessageData.push(message);
        });

        this.messageDataSubject.next(storedMessageData);
        observer.next(storedMessageData);
      });

      return () => unsubscribe();
    });
  }


}
