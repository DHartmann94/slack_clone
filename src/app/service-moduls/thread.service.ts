import { Injectable } from '@angular/core';
import {
  DocumentData,
  Firestore,
  QuerySnapshot,
  collection,
  getDocs,
  query,
  addDoc,
  onSnapshot,
  where,
} from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';

export interface MessageInterface {
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: string;
  userId?: string;
  mentionedUser?: string; //ID from mentioned user
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messageDataSubject: BehaviorSubject<MessageInterface[]> =
    new BehaviorSubject<MessageInterface[]>([]);
  public messageData$: Observable<MessageInterface[]> =
    this.messageDataSubject.asObservable();

  constructor(public firestore: Firestore) { }


  getThreadData(channelId: string): Observable<MessageInterface[]> {
    const messages = collection(this.firestore, 'messages');

    // Folgender String müsste angepasst werden. 
    const q = query(messages, where('channel', '==', channelId));

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const threadData: MessageInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { messageText, time, thread, emojis, channel, mentionedUser } =
            data;
          const message: MessageInterface = {
            messageText: messageText,
            time: time,
            thread: thread,
            emojis: emojis,
            channel: channel,
            mentionedUser: mentionedUser,
          };
          threadData.push(message);
        });

        return threadData;
      })
    );
  }
}
