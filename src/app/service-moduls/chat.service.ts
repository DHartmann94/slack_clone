import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, onSnapshot, query } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { MessageDataInterface } from './message.service';
import { UserDataInterface } from './user-data.service';

export interface ChatInterface {
  id?: any,
  messages?: MessageDataInterface[],
  users?: UserDataInterface[],
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private chatDataSubject: BehaviorSubject<ChatInterface[]> = new BehaviorSubject<ChatInterface[]>([]);
  public chatData$: Observable<ChatInterface[]> = this.chatDataSubject.asObservable();

  constructor(
    public firestore: Firestore,
  ) { }

  getChatData(): Observable<ChatInterface[]> {
    const chatCollection = collection(this.firestore, 'chats');
    const q = query(chatCollection);

    return new Observable<ChatInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storedChatData: ChatInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { users, messages } = data;
          const directMessage: ChatInterface = {
            id: doc.id,
            users: users,
            messages: messages
          };
          storedChatData.push(directMessage);
        });

        this.chatDataSubject.next(storedChatData);
        observer.next(storedChatData);
      });

      return () => unsubscribe();
    });
  }
}
