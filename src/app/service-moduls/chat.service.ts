import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, addDoc, collection, getDocs, onSnapshot, query } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { MessageDataInterface } from './message.service';
import { UserDataInterface } from './user.service';

export interface ChatDataInterface {
  id?: any,
  messages?: MessageDataInterface[],
  users?: UserDataInterface[],
}

@Injectable({
  providedIn: 'root'
})
export class ChatDataService {

  private chatDataSubject: BehaviorSubject<ChatDataInterface[]> = new BehaviorSubject<ChatDataInterface[]>([]);
  public chatData$: Observable<ChatDataInterface[]> = this.chatDataSubject.asObservable();

  constructor(
    public firestore: Firestore,
  ) { }

  getChatData(): Observable<ChatDataInterface[]> {
    const chatCollection = collection(this.firestore, 'chats');
    const q = query(chatCollection);

    return new Observable<ChatDataInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storedChatData: ChatDataInterface[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { users, messages } = data;
          const directMessage: ChatDataInterface = {
            id: doc.id,
            users: users,
            messages: messages,
          };
          storedChatData.push(directMessage);
        });

        this.chatDataSubject.next(storedChatData);
        observer.next(storedChatData);
      });

      return () => unsubscribe();
    });
  }

  addMessageToChat(chat: ChatDataInterface) : Observable<ChatDataInterface> {
    const chatsCollection  = collection(this.firestore, 'chats');
    return from(addDoc(chatsCollection, chat)).pipe(
      map((docRef) => {
        const newChat: MessageDataInterface = {
          ...chat,
          id: docRef.id,
          messageText: [],
        };
        return newChat;
      })
    );
  }
}
