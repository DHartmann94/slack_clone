import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, updateDoc, doc, getDoc, setDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';

export interface ThreadDataInterface {
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
export class ThreadDataService {
  private threadDataSubject: BehaviorSubject<ThreadDataInterface[]> = new BehaviorSubject<ThreadDataInterface[]>([]);
  public messageData$: Observable<ThreadDataInterface[]> = this.threadDataSubject.asObservable();

  constructor(public firestore: Firestore) {}

  async openThread(messageId: string) {
    const docRef = doc(this.firestore, 'messages', messageId);
    const docSnap = await getDoc(docRef);
    const messageData = docSnap.data();

    if (messageData && !messageData['thread']) {
      const newThreadData = {

        messageText: messageData['messageText'],
        time: messageData['time'],
        emojis: messageData['emojis'],
        sentBy: messageData['sentBy'],
        sentById: messageData['sentById'],
        mentionedUser: messageData['mentionedUser'],
      };

      const threadCollectionRef = collection(this.firestore, 'threads');
      const threadDocRef = await addDoc(threadCollectionRef, newThreadData);

      await setDoc(docRef, { thread: threadDocRef.id }, { merge: true });
      
    } else if (messageData && messageData['thread']) {
      console.log('opened existing thread');
    }
  }

  getThreadData(): Observable<ThreadDataInterface[]> {
    const threadCollection = collection(this.firestore, 'messages');
    const q = query(threadCollection);

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const threadData: ThreadDataInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { messageText, time, thread, emojis, channel, mentionedUser } = data;
          const message: ThreadDataInterface = {
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
