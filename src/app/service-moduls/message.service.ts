import { Injectable } from '@angular/core';
import { Firestore, collection, query, addDoc, onSnapshot, doc, updateDoc } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataService } from './user.service';

export interface MessageDataInterface {
  id?: any;
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: any;
  invitedChannelId?: any,
  sentBy?: string;
  picture?: string;
  sentById?: string;
  mentionedUser?: any;
  senderName?: string;
  numberOfThreads?: any;
}

@Injectable({
  providedIn: 'root',
})

export class MessageDataService {
  private messageDataSubject: BehaviorSubject<MessageDataInterface[]> = new BehaviorSubject<MessageDataInterface[]>([]);
  public messageData$: Observable<MessageDataInterface[]> = this.messageDataSubject.asObservable();

  constructor(
    public firestore: Firestore,
    private userDataService: UserDataService,
  ) { }

  getMessageData(): Observable<MessageDataInterface[]> {
    const messageCollection = collection(this.firestore, 'messages');
    const q = query(messageCollection);

    return new Observable<MessageDataInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedMessageData: MessageDataInterface[] = [];
        const threadResponses: Record<string, number> = {};

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { messageText, time, thread, emojis, sentById, channel, mentionedUser, invitedChannelId } = data;

          try {
            const { userName, userPicture } = await this.getUserData(sentById);

            this.countThreadResponses(thread, threadResponses);

            const message: MessageDataInterface = {
              id: doc.id,
              messageText: messageText,
              time: time,
              thread: thread,
              emojis: emojis,
              channel: channel,
              invitedChannelId: invitedChannelId,
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

  sendMessage(message: MessageDataInterface): Observable<MessageDataInterface> {
    const messages = collection(this.firestore, 'messages');
    return from(addDoc(messages, message)).pipe(
      map((docRef) => {
        const newMessage: MessageDataInterface = {
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

    const newMessageData = {
      messageText: 'This message has been deleted'
    };

    return from(updateDoc(messageDoc, newMessageData));
  }

  updateMessage(messageId: any, emojiUpdate: object): Observable<void> {
    const messagesCollection = collection(this.firestore, 'messages');
    const messageDoc = doc(messagesCollection, messageId);
    return from(updateDoc(messageDoc, { emojis: emojiUpdate }));
  }
}
