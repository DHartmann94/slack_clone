import { Injectable } from '@angular/core';
import { Firestore, collection, query, addDoc, onSnapshot, doc, deleteDoc, updateDoc, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject, Subject } from 'rxjs';
import { UserDataInterface } from './user.service';
import { UserDataService } from './user.service';
import { ChannelDataInterface } from './channel.service';

export interface DirectMessageInterface {
  id?: any;
  messageText?: any;
  time?: number;
  emojis?: any;
  thread?: any;
  newChat?: string;
  channel?: any;
  sentBy?: string;
  picture?: string;
  sentById?: string;
  users?: UserDataInterface[],
}

@Injectable({
  providedIn: 'root'
})

export class DirectMessageService {
  private directMessageDataSubject: BehaviorSubject<DirectMessageInterface[]> = new BehaviorSubject<DirectMessageInterface[]>([]);
  public directMessageData$: Observable<DirectMessageInterface[]> = this.directMessageDataSubject.asObservable();

  constructor(
    public firestore: Firestore,
    private userDataService: UserDataService,
  ) { }

  
  getDirectMessageData(): Observable<DirectMessageInterface[]> {
    const directMessageCollection = collection(this.firestore, 'directMessage');
    const q = query(directMessageCollection);

    return new Observable<DirectMessageInterface[]>((observer) => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const storedDirectMessageData: DirectMessageInterface[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { messageText,time, thread, emojis, sentById, channel, newChat } = data;

          try {
            const userData = await this.userDataService.usersDataBackend(sentById);
            let userName: string;
            let userPicture: string;

            if (userData !== null) {
              userName = userData['name'];
              userPicture = userData['picture'];
            } else {
              userName = 'Unknown User';
              userPicture = '/assets/profile-pictures/unknown-user.png';
            }

            const directMessage: DirectMessageInterface = {
              id: doc.id,
              messageText: messageText,
              time: time,
              thread: thread,
              newChat: newChat,
              emojis: emojis,
              sentBy: userName,
              picture: userPicture,
              sentById: sentById,
            };
            storedDirectMessageData.push(directMessage);
          } catch (error) {
            console.log('ERROR retrieving user data:', error);
          }
        }

        this.directMessageDataSubject.next(storedDirectMessageData);
        observer.next(storedDirectMessageData);
      });

      return () => unsubscribe();
    });
  }

  sendDirectMessage(message: DirectMessageInterface): Observable<DirectMessageInterface> {
    const directMessage = collection(this.firestore, 'directMessage');
    return from(addDoc(directMessage, message)).pipe(
      map((docRef) => {
        const newDirectMessage: DirectMessageInterface = {
          ...message,
          id: docRef.id,
        };
        return newDirectMessage;
      })
    );
  }

  deleteDirectMessage(messageId: any): Observable<void> {
    const directMessagesCollection = collection(this.firestore, 'directMessage');
    const messageDoc = doc(directMessagesCollection, messageId);
    return from(deleteDoc(messageDoc));
  }

  updateDirectMessage(messageId: any, emojiUpdate: object): Observable<void> {
    const directMessagesCollection = collection(this.firestore, 'directMessage');
    const directMessageDoc = doc(directMessagesCollection, messageId);
    return from(updateDoc(directMessageDoc, { emojis: emojiUpdate }));
  }

  addUserToDirectMessage(user: UserDataInterface): Observable<string> {
    const directMessageCollection = collection(this.firestore, 'directMessage');
    const newDirectMessage: DirectMessageInterface = {
      users: [user],
    };

    return from(addDoc(directMessageCollection, newDirectMessage)).pipe(
      map((docRef) => {
        return docRef.id;
      })
    );
  }

  addChannelToDirectMessage(channel: ChannelDataInterface): Observable<string> {
    const directMessageCollection = collection(this.firestore, 'directMessage');
    const newDirectMessage: DirectMessageInterface = {
      channel: [channel],
    };

    return from(addDoc(directMessageCollection, newDirectMessage)).pipe(
      map((docRef) => {
        return docRef.id;
      })
    );
  }
}
