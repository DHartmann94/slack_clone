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
  mentionedUser?: string; // ID from the mentioned user
  channelId?: string;
  users?: string[]; // Add the 'users' property
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
    const threads = collection(this.firestore, 'threads');

    // You can define the properties of the new thread here, e.g., messageText, time, etc.
    const newThread: ThreadInterface = {
      messageText: 'Your initial message for the new thread',
      time: Date.now(),
      // Add other properties as needed
    };

    // Use the addDoc function to create a new document (thread) in the "threads" collection
    addDoc(threads, newThread)
      .then((docRef) => {
        console.log('New thread created with ID:', docRef.id);
      })
      .catch((error) => {
        console.error('Error creating thread:', error);
      });
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
