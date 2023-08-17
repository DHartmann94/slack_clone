import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query, addDoc, onSnapshot, where, doc, updateDoc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { UserDataService } from './user.service';

export interface DirectMessageToUserInterface {
  id?: any;
  messageText: any;
  time?: number;
  emojis?: any;
  channel?: any;
  sentBy?: string;
  picture?: string;
  sentById?: string;
  mentionedUser?: string;
  senderName?: string;
  numberOfThreads?: any;
}

@Injectable({
  providedIn: 'root',
})

export class DirectMessageToUserService {
  private messageDataSubject: BehaviorSubject<DirectMessageToUserInterface[]> = new BehaviorSubject<DirectMessageToUserInterface[]>([]);
  public messageData$: Observable<DirectMessageToUserInterface[]> = this.messageDataSubject.asObservable();

  directMessageToUserOpen: boolean = false;

  constructor(
    public firestore: Firestore,
    private userDataService: UserDataService,
  ) { }

  getMessageData(): Observable<DirectMessageToUserInterface[]> {
    const messageCollection = collection(this.firestore, 'directMessageToUser');
    const q = query(messageCollection);

    return new Observable<DirectMessageToUserInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedMessageData: DirectMessageToUserInterface[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { messageText, time, emojis, sentById, mentionedUser } = data;

          try {
            const { userName, userPicture } = await this.getUserData(sentById);

            const message: DirectMessageToUserInterface = {
              id: doc.id,
              messageText: messageText,
              time: time,
              emojis: emojis,
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

  async getUserData(sentById: string) {
    const userData = await this.userDataService.usersDataBackend(sentById);
    if (userData !== null) {
      return {
        userName: userData['name'],
        userPicture: userData['picture'],
      };
    } else {
      return {
        userName: 'Unknown User',
        userPicture: '/assets/profile-pictures/unknown-user.png',
      };
    }
  }

  sendMessage(message: DirectMessageToUserInterface): Observable<DirectMessageToUserInterface> {
    const messages = collection(this.firestore, 'directMessageToUser');
    return from(addDoc(messages, message)).pipe(
      map((docRef) => {
        const newMessage: DirectMessageToUserInterface = {
          ...message,
          id: docRef.id,
        };
        return newMessage;
      })
    );
  }

  deleteMessage(messageId: any): Observable<void> {
    const messagesCollection = collection(this.firestore, 'directMessageToUser');
    const messageDoc = doc(messagesCollection, messageId);

    return from(deleteDoc(messageDoc));
  }

  updateMessage(messageId: any, emojiUpdate: object): Observable<void> {
    const messagesCollection = collection(this.firestore, 'directMessageToUser');
    const messageDoc = doc(messagesCollection, messageId);
    return from(updateDoc(messageDoc, { emojis: emojiUpdate }));
  }


  setDirectMessageToUserId() {
    this.directMessageToUserOpen = true;
    //setTimeout(() => {
      //this.directMessageToUserId = directMessageToUserID;
      //this.triggerdirectMessageToUserUpdate();
    //}, 100);

  }

 
  
}
