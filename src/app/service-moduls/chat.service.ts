import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';

export interface MessageInterface {
  id?: any;
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: string;
  sentBy?: string;
  sentById?: string,
  mentionedUser?: string;
  senderName?: string;
}

export interface ChatInterface {
  id?: string;

}

@Injectable({
  providedIn: 'root',
})

export class ChatService {
  private messageDataSubject: BehaviorSubject<MessageInterface[]> = new BehaviorSubject<MessageInterface[]>([]);
  public messageData$: Observable<MessageInterface[]> = this.messageDataSubject.asObservable();

  constructor(public firestore: Firestore) { }

  getMessage(): Observable<MessageInterface[]> {
    const messages = collection(this.firestore, 'messages');
    const q = query(messages);

    return new Observable<MessageInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storedMessageData: MessageInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          const { messageText, time, thread, emojis, sentBy, sentById, channel, mentionedUser } =
            data;
          const message: MessageInterface = {
            id: doc.id,
            messageText: messageText,
            time: time,
            thread: thread,
            emojis: emojis,
            channel: channel,
            sentBy: sentBy,
            sentById: sentById,
            mentionedUser: mentionedUser,
          };
          storedMessageData.push(message);
        });

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
        const { id, messageText, time, thread, emojis, sentBy, channel, mentionedUser } =
          data;
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

  updateMessage(messageId: any, emojiUpdate:object): Observable<void> {
    const messagesCollection = collection(this.firestore, 'messages');
    const messageDoc = doc(messagesCollection, messageId);
    return from(updateDoc(messageDoc, { 'emojis': emojiUpdate}));
  }


  getThreadData(channelId: string): Observable<MessageInterface[]> {
    const messages = collection(this.firestore, 'messages');

    // Folgender String müsste angepasst werden.
    const q = query(messages, where('channel', '==', channelId));

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const threadData: MessageInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { id, messageText, time, thread, emojis, sentBy, sentById, channel, mentionedUser } =
            data;
          const message: MessageInterface = {
            id: id,
            messageText: messageText,
            time: time,
            thread: thread,
            emojis: emojis,
            sentBy: sentBy,
            sentById: sentById,
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
function $any(update: string[]): any {
  throw new Error('Function not implemented.');
}

