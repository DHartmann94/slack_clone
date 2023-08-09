import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, updateDoc, doc, getDoc, setDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject, Subscription } from 'rxjs';
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

  /*async openThread(messageId: string) { // TEST Daniel!!!
    const docRef = doc(this.firestore, 'messages', messageId);
    const docSnap = await getDoc(docRef);
    const messageData = docSnap.data();
    console.log(docSnap.id);

    if (messageData) {
      const threadDataSubscription: Subscription = this.getThreadData().subscribe(
        async (threadData: ThreadDataInterface[]) => {
          console.log(threadData);

          const existThread = threadData.find(thread => thread['id'] === docSnap.id);
          console.log(existThread);
          if (existThread) {
            //console.log('existThread',existThread);
            
            const threadData = {
              id: existThread['id'],
              messageText: existThread['messageText'],
              time: existThread['time'],
              thread: existThread['thread'],
              emojis: existThread['emojis'],
              channel: existThread['channel'],
              sentById: existThread['sentById'],
            };
          } else {
            const newThreadData = {

              id: docSnap.id,
              messageText: messageData['messageText'],
              time: messageData['time'],
              thread: messageData['thread'],
              emojis: messageData['emojis'],
              channel: messageData['channel'],
              sentById: messageData['sentById'],
            };
            //console.log('New', newThreadData);
            //const threadCollectionRef = collection(this.firestore, 'threads');
            //await addDoc(threadCollectionRef, newThreadData);


            //await setDoc(docRef, { thread: threadDocRef.id }, { merge: true });
          }
          threadDataSubscription.unsubscribe();
        },
        (error) => {
          console.error('ERROR open thread:', error);
          threadDataSubscription.unsubscribe();
        }
      );
    }
  }*/

  /*getThreadData(): Observable<ThreadDataInterface[]> { // TEST Daniel!!!
    const threadCollection = collection(this.firestore, 'threads');
    const q = query(threadCollection);

    return new Observable<ThreadDataInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedMessageData: ThreadDataInterface[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { messageText,time, thread, emojis, sentById, channel } = data;

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
              thread: thread,
              emojis: emojis,
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
  }*/
}
