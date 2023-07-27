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
            id: doc.id,
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
        // console.log('Message sent');
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


// ********* Noch nicht ganz fertig: update ist ein Array, kein Objekt??
  async updateMessageData(update:MessageInterface[]) {
    await this.updateFirebase(update);
  }

  async updateFirebase(update:MessageInterface[]) {
    const jsonData = JSON.stringify(update);
    console.log('is this my oject?', jsonData);


    try {
      const messagesRef = collection(this.firestore, "messages");
      const q = query(messagesRef);

      const querySnapshot = await getDocs(q);

      const promises = querySnapshot.docs.map(async (docSnapshot) => {
        const docRef = doc(this.firestore, "messages", docSnapshot.id);
        // await updateDoc(docRef, update);
      });

      await Promise.all(promises);
      console.log('Sammlung "messages" erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Sammlung "messages":', error);
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

