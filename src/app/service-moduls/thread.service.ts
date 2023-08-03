import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, updateDoc, doc, getDoc, setDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataInterface } from './user.service';
import { MessageDataInterface } from './message.service';
import { ChatDataInterface } from './chat.service';


export interface ThreadDataInterface {
  id: any;
  users?: UserDataInterface[];
  messages?: MessageDataInterface[];
  chats: ChatDataInterface[];
}

@Injectable({
  providedIn: 'root',
})
export class ThreadDataService {
  private threadDataSubject$: BehaviorSubject<ThreadDataInterface[]> = new BehaviorSubject<ThreadDataInterface[]>([]);
  public threadData: Observable<ThreadDataInterface[]> = this.threadDataSubject$.asObservable();

  constructor(public firestore: Firestore) { }

  /*async openThread(messageId: string) {
    const docRef = doc(this.firestore, 'messages', messageId);
    const docSnap = await getDoc(docRef);
    const messageData = docSnap.data();

    if (messageData && !messageData['thread']) {
      const newThreadData = {

        messageText: messageData['messageText'],
        time: messageData['time'],
        emojis: messageData['emojis'],
        sentById: messageData['sentById'],
        mentionedUser: messageData['mentionedUser'],
      };

      const threadCollectionRef = collection(this.firestore, 'threads');
      const threadDocRef = await addDoc(threadCollectionRef, newThreadData);

      await setDoc(docRef, { thread: threadDocRef.id }, { merge: true });

    } else if (messageData && messageData['thread']) {
      console.log('opened existing thread');
    }
  }*/

  generateThreadId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters.charAt(randomIndex);
    }

    return id;
  }

  getThreadData(): Observable<ThreadDataInterface[]> {
    const threadCollection = collection(this.firestore, 'threads');
    const q = query(threadCollection);

    return new Observable<ThreadDataInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const threadData: ThreadDataInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { users, messages, chats } = data;
          const thread: ThreadDataInterface = {
            id: doc.id,
            users: users,
            messages: messages,
            chats: chats,
          };
          threadData.push(thread);
        });

        this.threadDataSubject$.next(threadData);
        observer.next(threadData);
      });

      return () => unsubscribe();
    });
  }
}
