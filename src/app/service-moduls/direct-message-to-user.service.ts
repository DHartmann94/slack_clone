import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataService } from './user.service';

export interface DirectMessageToUserInterface {
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
  numberOfThreads?: any;
}

@Injectable({
  providedIn: 'root',
})

export class DirectMessageToUserService {
  private messageDataSubject: BehaviorSubject<DirectMessageToUserInterface[]> = new BehaviorSubject<DirectMessageToUserInterface[]>([]);
  public messageData$: Observable<DirectMessageToUserInterface[]> = this.messageDataSubject.asObservable();

  constructor(
    public firestore: Firestore,
    private userDataService: UserDataService,
  ) { }

  getMessageData(): Observable<DirectMessageToUserInterface[]> {
    const messageCollection = collection(this.firestore, 'messages');
    const q = query(messageCollection);

    return new Observable<DirectMessageToUserInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedMessageData: DirectMessageToUserInterface[] = [];
        const threadResponses: Record<string, number> = {};

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { messageText, time, thread, emojis, sentById, channel, mentionedUser } = data;

          try {
            const { userName, userPicture } = await this.getUserData(sentById);

            this.countThreadResponses(thread, threadResponses);

            const message: DirectMessageToUserInterface = {
              id: doc.id,
              messageText: messageText,
              time: time,
              thread: thread,
              emojis: emojis,
              channel: channel,
              sentBy: userName,
              picture: userPicture,
              sentById: sentById,
              mentionedUser: mentionedUser,
              numberOfThreads: threadResponses,
            };
            storedMessageData.push(message);
          } catch (error) {
            console.log('ERROR retrieving user data:', error);
          }
        }

        this.messageDataSubject.next(storedMessageData);
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

  countThreadResponses(thread: string, threadResponses: Record<string, number>) {
    if (thread) {
      if (threadResponses.hasOwnProperty(thread)) {
        threadResponses[thread]++;
      } else {
        threadResponses[thread] = 0;
      }
    }
  }

  sendMessage(message: DirectMessageToUserInterface): Observable<DirectMessageToUserInterface> {
    const messages = collection(this.firestore, 'messages');
    return from(addDoc(messages, message)).pipe(
      map((docRef) => {
        const newMessage: DirectMessageToUserInterface = {
          ...message,
          id: docRef.id,
        };
        return newMessage;
      })
    );
  }

  deleteMessage(messageId: any): Observable<void> {
    const messagesCollection = collection(this.firestore, 'messages');
    const messageDoc = doc(messagesCollection, messageId);

    return from(deleteDoc(messageDoc));
  }

  updateMessage(messageId: any, emojiUpdate: object): Observable<void> {
    const messagesCollection = collection(this.firestore, 'messages');
    const messageDoc = doc(messagesCollection, messageId);
    return from(updateDoc(messageDoc, { emojis: emojiUpdate }));
  }
}