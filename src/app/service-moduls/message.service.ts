import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataService } from '../service-moduls/user-data.service';

export interface MessageInterface {
  id?: any;
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: string;
  sentBy?: string;
  picture?: string;
  sentById?: string;
  mentionedUser?: string;
  senderName?: string;
}

@Injectable({
  providedIn: 'root',
})

export class MessageService {
  private messageDataSubject: BehaviorSubject<MessageInterface[]> = new BehaviorSubject<MessageInterface[]>([]);
  public messageData$: Observable<MessageInterface[]> = this.messageDataSubject.asObservable();

  constructor(public firestore: Firestore, private userDataService: UserDataService,) {}

  getMessage(): Observable<MessageInterface[]> {
    const messages = collection(this.firestore, 'messages');
    const q = query(messages);
  
    return new Observable<MessageInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedMessageData: MessageInterface[] = [];
  
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const {
            messageText,
            time,
            thread,
            emojis,
            sentBy,
            sentById,
            channel,
            mentionedUser,
          } = data;
  
          try {
            const userData = await this.userDataService.usersDataBackend(sentById);
            let userName: string;
            let userPicture: string;
  
            if (userData !== null) {
              userName = userData['name'];
              userPicture = userData['picture'];
            } else {
              userName = 'Unknown User';
              userPicture = '/assets/profile-pictures/avatar1.png';
            }
  
            const message: MessageInterface = {
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

  sendMessage(message: MessageInterface): Observable<MessageInterface> {
    const messages = collection(this.firestore, 'messages');
    const messageData = {
      messageText: message.messageText,
      time: message.time,
      thread: message.thread,
      emojis: message.emojis,
      sentBy: message.sentBy,
      sentById: message.sentById,
      channel: message.channel,
      mentionedUser: message.mentionedUser,
    };

    return from(addDoc(messages, messageData)).pipe(
      map((docRef) => {
        const newMessage: MessageInterface = {
          ...message,
          id: docRef.id,
        };
        return newMessage;
      })
    );
  }

  subscribeToMessageUpdates() {
    const messagesCollection = collection(this.firestore, 'messages');
    const q = query(messagesCollection);

    onSnapshot(q, (querySnapshot) => {
      const updatedMessageData: MessageInterface[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const {
          id,
          messageText,
          time,
          thread,
          emojis,
          sentBy,
          channel,
          mentionedUser,
        } = data;
        const message: MessageInterface = {
          id: id,
          messageText: messageText,
          time: time,
          thread: thread,
          emojis: emojis,
          sentBy: sentBy,
          channel: channel,
          mentionedUser: mentionedUser,
        };
        updatedMessageData.push(message);
      });

      this.messageDataSubject.next(updatedMessageData);
    });
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
