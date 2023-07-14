import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';


export interface MessageInterface {
  id: string;
  text: any;
  time?: number;
  emojis?: any;
  thread?: any;
  channel?:string;
  userId?: string;
  mention?: string; //ID from mentioned user
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
          const { text, time, } = data;
          const message: MessageInterface = {
            id: doc.id,
            text: text,
            time: time,
            emojis: undefined,
            channel: '',
            mention: ''
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
