import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, updateDoc, doc, getDoc, setDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject, Subscription, Subject } from 'rxjs';
import { UserDataInterface, UserDataService } from './user.service';
import { MessageDataInterface } from './message.service';
import { ChatDataInterface } from './chat.service';


/*export interface ThreadDataInterface {
  id: any;
  users?: UserDataInterface[];
  messages?: MessageDataInterface[];
  chats: ChatDataInterface[];
}*/

export interface ThreadDataInterface {
  id?: any;
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: any;
  sentBy?: string;
  picture?: string;
  sentById?: string;
  mentionedUser?: string;
  senderName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThreadDataService {
  private threadDataSubject$: BehaviorSubject<ThreadDataInterface[]> = new BehaviorSubject<ThreadDataInterface[]>([]);
  public threadData: Observable<ThreadDataInterface[]> = this.threadDataSubject$.asObservable();

  threadId: string = '';
  threadOpen: boolean = false;
  private threadUpdateSubject = new Subject<void>();

  get threadUpdate$() {
    return this.threadUpdateSubject.asObservable();
  }

  triggerThreadUpdate() {
    this.threadUpdateSubject.next();
  }

  constructor(public firestore: Firestore, private userDataService: UserDataService,) { }

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

  /*getThreadData(): Observable<ThreadDataInterface[]> {
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
  /* --- Daniel Test --- */
  async checkThreadMessage(messageId: string) {
    const docRef = doc(this.firestore, 'messages', messageId);
    const docSnap = await getDoc(docRef);
    const messageData = docSnap.data();

    if (messageData) {
      const threadData: any[] = [];
      const collectionThreads = collection(this.firestore, 'threads');
      const querySnapshot = await getDocs(collectionThreads);

      querySnapshot.forEach((doc) => {
        querySnapshot.forEach((doc) => {
          threadData.push({ threadId: doc.id, ...doc.data() });
        });
      });

      if (threadData) {
        const existThread = threadData.find((message) => message.id === docSnap.id);
        const newThreadData = this.overviewJSON(messageData, docSnap);

        if (existThread) {
          await this.updateThreadData(existThread, newThreadData)
        } else {
          await this.newThreadData(newThreadData);
        }

        this.triggerThreadUpdate();
      }
    }
  }

  overviewJSON(messageData: any, docSnapFromMeesage: any) {
    const threadData = {
      id: docSnapFromMeesage.id,
      messageText: messageData['messageText'],
      time: messageData['time'],
      emojis: messageData['emojis'],
      thread: messageData['thread'],
      channel: messageData['channel'],
      sentById: messageData['sentById'],
    };

    return threadData;
  }

  async updateThreadData(existThread: any, newThreadData: any) {
    const threadDocRef = doc(this.firestore, 'threads', existThread.threadId);


    await updateDoc(threadDocRef, newThreadData);
    console.log('Exist Thread', newThreadData);
  }

  async newThreadData(newThreadData: any) {
    console.log('New Thread', newThreadData);
    const threadCollectionRef = collection(this.firestore, 'threads');
    await addDoc(threadCollectionRef, newThreadData);
  }

  getThreadData(): Observable<ThreadDataInterface[]> {
    const threadCollection = collection(this.firestore, 'messages');
    const q = query(threadCollection);

    return new Observable<ThreadDataInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedMessageData: ThreadDataInterface[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { messageText, time, thread, emojis, sentById, channel } = data;

          try {
            const userData = await this.userDataService.usersDataBackend(sentById);
            let userName: string;
            let userPicture: string;

            if (userData !== null) {
              userName = userData['name'];
              userPicture = userData['picture'];
            } else {
              userName = 'Unknown User';
              userPicture = '/assets/profile-pictures/unknown-user.png';
            }

            const threadData: ThreadDataInterface = {
              id: doc.id,
              messageText: messageText,
              time: time,
              emojis: emojis,
              thread: thread,
              channel: channel,
              sentBy: userName,
              picture: userPicture,
              sentById: sentById,
            };
            storedMessageData.push(threadData);
          } catch (error) {
            console.log('ERROR retrieving thread data:', error);
          }
        }

        this.threadDataSubject$.next(storedMessageData);
        observer.next(storedMessageData);
      });

      return () => unsubscribe();
    });
  }

  setThreadId(threadID: string) {
    this.threadOpen = true;
    setTimeout(() => {
      this.threadId = threadID;
      this.triggerThreadUpdate();
    }, 100);

  }

}
