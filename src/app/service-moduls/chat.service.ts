import { Injectable } from '@angular/core';
import {DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc,} from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';

export interface MessageInterface {
  id?: any;
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: string;
  sentBy?: string;
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

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const storedMessageData: MessageInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { messageText, time, thread, emojis, sentBy, channel, mentionedUser } =
            data;
          const message: MessageInterface = {
            messageText: messageText,
            time: time,
            thread: thread,
            emojis: emojis,
            channel: channel,
            sentBy: sentBy,
            mentionedUser: mentionedUser,
          };
          storedMessageData.push(message);
        });
        this.messageDataSubject.next(storedMessageData); // Update BehaviorSubject with the latest data
        return storedMessageData;
      })
    );
  }

  sendMessage(message: MessageInterface): Observable<void> {
    const messages = collection(this.firestore, 'messages');
    const messageData = {
      messageText: message.messageText,
      time: message.time,
      thread: message.thread,
      emojis: message.emojis,
      sentBy: message.sentBy,
      channel: message.channel,
      mentionedUser: message.mentionedUser,
    };

    return from(addDoc(messages, messageData)).pipe(
      map(() => {
        console.log('Message sent');
      })
    );
  }

  // Add this method to subscribe to real-time updates
  subscribeToMessageUpdates() {
    const messagesCollection = collection(this.firestore, 'messages');
    const q = query(messagesCollection);

    onSnapshot(q, (querySnapshot) => {
      const updatedMessageData: MessageInterface[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const { messageText, time, thread, emojis, sentBy, channel, mentionedUser } =
          data;
        const message: MessageInterface = {
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

      // Update the BehaviorSubject with real-time data
      this.messageDataSubject.next(updatedMessageData);
    });
  }

  async updateMessageData(update:any) {
    await this.changeFirebase(update , 'messages');
  }
  
  async changeFirebase(newValue: Array<any>, type: string) {
    debugger
    const userDocRef = doc(this.firestore, 'messages');
    try {
      await updateDoc(userDocRef, { [type]: newValue });
      console.log('Chat wurde aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Chats', error);
    }
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
          const { messageText, time, thread, emojis,sentBy, channel, mentionedUser } =
            data;
          const message: MessageInterface = {
            messageText: messageText,
            time: time,
            thread: thread,
            emojis: emojis,
            sentBy: sentBy,
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
