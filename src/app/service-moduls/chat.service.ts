import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';


export interface MessageInterface {
  messageText: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?:string;
  userId?: string;
  mentionedUser?: string; //ID from mentioned user
}

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  messageData: MessageInterface[] = [];

  constructor(
    public firestore: Firestore
  ) {}

  getMessage(): Observable<MessageInterface[]> {
    const messages = collection(this.firestore, 'messages');
    const q = query(messages);

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const storedMessageData: MessageInterface[] = [];

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const { messageText, time, thread, emojis, channel, mentionedUser} = data;
          const message: MessageInterface = {
            messageText: messageText,
            time: time,
            thread: thread,
            emojis: emojis,
            channel: channel,
            mentionedUser: mentionedUser,
          };
          storedMessageData.push(message);
        });
        this.messageData = storedMessageData;
        return storedMessageData;
      })
    );
  }

  sendMessage() {
    

    console.log('sendMessage');
  }
}
