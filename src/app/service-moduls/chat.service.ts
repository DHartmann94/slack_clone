import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';

export interface MessageInterface {
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?: string;
  sentBy?: string;
  mentionedUser?: string; //ID from mentioned user
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
        // Message sent successfully (already updated in local messageData)
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




// ********* Noch nicht ganz fertig: update ist ein Array, kein Objekt??
  async updateMessageData(update: object) {
    debugger
    await this.changeFirebase(update, '2mWSkWVtnVnIn83EpDci');
  }

  async changeFirebase(update:object, id: string) {
    const docInstance = doc(this.firestore, 'messages', id);
    try {
      await updateDoc(docInstance, update);
  
      console.log('Daten erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Daten:', error);
    }
  }
  ////***************** */





  getThreadData(channelId: string): Observable<MessageInterface[]> {
    const messages = collection(this.firestore, 'messages');

    // Folgender String müsste angepasst werden.
    const q = query(messages, where('channel', '==', channelId));

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const threadData: MessageInterface[] = [];

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
          threadData.push(message);
        });

        return threadData;
      })
    );
  }
}
