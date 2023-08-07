import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, addDoc, collection, getDocs, onSnapshot, query } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { MessageDataInterface } from './message.service';
import { UserDataInterface, UserDataService } from './user.service';

export interface ChatDataInterface {
  id?: any,
  messages?: MessageDataInterface[],
  users?: UserDataInterface[],
  userNname?: string,
  userPicture?: string,
}

@Injectable({
  providedIn: 'root'
})
export class ChatDataService {

  private chatDataSubject: BehaviorSubject<ChatDataInterface[]> = new BehaviorSubject<ChatDataInterface[]>([]);
  public chatData$: Observable<ChatDataInterface[]> = this.chatDataSubject.asObservable();

  constructor(
    public firestore: Firestore,
    public userDataService: UserDataService
  ) { }

  getChatData(): Observable<ChatDataInterface[]> {
    const chatCollection = collection(this.firestore, 'chats');
    const q = query(chatCollection);

    return new Observable<ChatDataInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedChatData: ChatDataInterface[] = [];

        querySnapshot.forEach(async (doc) => {
          const data = doc.data();
          const { users, messages } = data;

          /*let userName: string =  'Unknown User';
          let userPicture: string =  '/assets/profile-pictures/avatar1.png';

          let userId = messages[0].sentById;
          if(userId) {
            const userData = await this.userDataService.usersDataBackend(userId)
  
            if (userData !== null) {
              userName = userData['name'];
              userPicture = userData['picture'];
            } else {
              userName = 'Unknown User';
              userPicture = '/assets/profile-pictures/avatar1.png';
            }
          }*/

          const chats: ChatDataInterface = {
            id: doc.id,
            users: users,
            messages: messages,
            //userNname: userName,
            //userPicture: userPicture
          };
          storedChatData.push(chats);
        });

        this.chatDataSubject.next(storedChatData);
        observer.next(storedChatData);
      });

      return () => unsubscribe();
    });
  }

  // Test von Daniel
  /*getChatData(): Observable<ChatDataInterface[]> {
    const chatCollection = collection(this.firestore, 'chats');
    const q = query(chatCollection);

    return new Observable<ChatDataInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedChatData: ChatDataInterface[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { users, messages } = data;

          try {
          let userName: string =  'Unknown User';
          let userPicture: string =  '/assets/profile-pictures/avatar1.png';

          let userId = messages[0].sentById;
          if(userId) {
            const userData = await this.userDataService.usersDataBackend(userId)
  
            if (userData !== null) {
              userName = userData['name'];
              userPicture = userData['picture'];
            } else {
              userName = 'Unknown User';
              userPicture = '/assets/profile-pictures/avatar1.png';
            }
          }

          const chats: ChatDataInterface = {
            id: doc.id,
            users: users,
            messages: messages,
            userNname: userName,
            userPicture: userPicture
          };
          storedChatData.push(chats);
          } catch (error) {
            console.log('ERROR retrieving user data:', error);
          }
        }

        this.chatDataSubject.next(storedChatData);
        observer.next(storedChatData);
      });

      return () => unsubscribe();
    });
  }*/

  addMessageToChat(message: MessageDataInterface): Observable<string> {
    const chatCollection = collection(this.firestore, 'chats');
    const newChat: ChatDataInterface = {
      messages: [message],
    };

    return from(addDoc(chatCollection, newChat)).pipe(
      map((docRef) => {
        return docRef.id;
      })
    );
  }
}
