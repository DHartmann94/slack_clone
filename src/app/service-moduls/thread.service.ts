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

export interface ThreadInterface {
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
export class ThreadService {
  private messageDataSubject: BehaviorSubject<ThreadInterface[]> =
    new BehaviorSubject<ThreadInterface[]>([]);
  public messageData$: Observable<ThreadInterface[]> =
    this.messageDataSubject.asObservable();

  constructor(public firestore: Firestore) {}

  openThread() {
    console.log('create/open thread');
  }

  getThreadData(): Observable<ThreadInterface[]> {
    const threads = collection(this.firestore, 'messages');
    const q = query(threads);

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const threadData: ThreadInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { messageText, time, thread, emojis, channel, mentionedUser } =
            data;
          const message: ThreadInterface = {
            messageText: messageText,
            time: time,
            thread: thread,
            emojis: emojis,
            channel: channel,
            mentionedUser: mentionedUser,
          };
          threadData.push(message);
        });

        console.log('thread messages', threadData); // Corrected logging

        return threadData;
      })
    );
  }
}
