import { Injectable } from '@angular/core';
import { Firestore, collection, query, addDoc, onSnapshot, updateDoc, doc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { UserDataService } from './user.service';

export interface ThreadDataInterface {
  id?: any;
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: any;
  directMessageTo?: any,
  sentBy?: string;
  picture?: string;
  sentById?: string;
  mentionedUser?: any;
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

  constructor(
    public firestore: Firestore, 
    private userDataService: UserDataService,
  ) { }

  generateThreadId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters.charAt(randomIndex);
    }

    return id;
  }

  async updateThreadData(existThread: any, newThreadData: any) {
    const threadDocRef = doc(this.firestore, 'threads', existThread.threadId);
    await updateDoc(threadDocRef, newThreadData);
  }

  async newThreadData(newThreadData: any) {
    const threadCollectionRef = collection(this.firestore, 'threads');
    await addDoc(threadCollectionRef, newThreadData);
  }

  getThreadDataMessages(): Observable<ThreadDataInterface[]> {
    const threadCollection = collection(this.firestore, 'messages');
    const q = query(threadCollection);

    return new Observable<ThreadDataInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedMessageData: ThreadDataInterface[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { messageText, time, thread, emojis, sentById, channel, mentionedUser} = data;

          try {
            const { userName, userPicture } = await this.getUserData(sentById);

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
              mentionedUser: mentionedUser,
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

  async getUserData(sentById: string) {
    const userData = await this.userDataService.usersDataBackend(sentById);
    if (userData !== null) {
      return {
        userName: userData['name'],
        userPicture: userData['picture'],
      };
    } else {
      return {
        userName: 'Unknown User',
        userPicture: '/assets/profile-pictures/unknown-user.png',
      };
    }
  }

  setThreadId(threadID: string) {
    this.threadOpen = true;
    setTimeout(() => {
      this.threadId = threadID;
      this.triggerThreadUpdate();
    }, 100);

  }
}
