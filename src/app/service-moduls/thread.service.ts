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
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';

export interface ThreadInterface {
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: string;
  userId?: string;
  mentionedUser?: string;
  channelId?: string;
  users?: string[];
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

  async openThread(messageId: string) {
    const docRef = doc(this.firestore, 'messages', messageId);
    const docSnap = await getDoc(docRef);
    const messageData = docSnap.data();

    if (messageData && !messageData['thread']) {
      const newThread = {};
      console.log('created new thread')

      const threadCollectionRef = collection(this.firestore, 'threads');
      const threadDocRef = await addDoc(threadCollectionRef, newThread);

      await setDoc(docRef, { thread: threadDocRef.id }, { merge: true });
    } else if (messageData && messageData['thread']) {
      console.log('upened existing  thread')
    }
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

        console.log('thread messages', threadData);

        return threadData;
      })
    );
  }
}
