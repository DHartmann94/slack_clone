import { Injectable } from '@angular/core';
import { Firestore, collection, query, addDoc, onSnapshot, doc, deleteDoc, updateDoc, QuerySnapshot, DocumentData, getDocs, } from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
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
  directMessageTo?: any;
  sentBy?: string;
  picture?: string;
  sentById?: string;
  mentionedUser?: string;
  numberOfThreads?: any;
  users?: UserDataInterface[],
}

@Injectable({
  providedIn: 'root'
})

export class DirectMessageService {
  private directMessageDataSubject: BehaviorSubject<DirectMessageInterface[]> = new BehaviorSubject<DirectMessageInterface[]>([]);
  public directMessageData$: Observable<DirectMessageInterface[]> = this.directMessageDataSubject.asObservable();

  userData: UserDataInterface[] = [];

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
        const threadResponses: Record<string, number> = {};

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const { messageText,time, thread, channel, emojis, sentById, newChat, mentionedUser, directMessageTo} = data;

          try {
            const { userName, userPicture } = await this.getUserData(sentById);
            this.countThreadResponses(thread, threadResponses);

            const directMessage: DirectMessageInterface = {
              id: doc.id,
              messageText: messageText,
              time: time,
              thread: thread,
              newChat: newChat,
              channel: channel,
              directMessageTo: directMessageTo,
              emojis: emojis,
              sentBy: userName,
              picture: userPicture,
              mentionedUser: mentionedUser,
              numberOfThreads: threadResponses,
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

  getUserDataDirect(): Observable<UserDataInterface[]> {
    const userCollection = collection(this.firestore, 'directChat');
    const q = query(userCollection);

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const storedUserData: UserDataInterface[] = [];

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const { name, email, picture, status } = data;
          const user: UserDataInterface = {
            id: doc.id,
            name: name,
            email: email,
            picture: picture,
            status: status
          };
          storedUserData.push(user);
        });
        this.userData = storedUserData;
        return storedUserData;
      })
    );
  }

  countThreadResponses(thread: string, threadResponses: Record<string, number>) {
    if (thread) {
      if (threadResponses.hasOwnProperty(thread)) {
        threadResponses[thread]++;
      } else {
        threadResponses[thread] = 0;
      }
    }
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

  addUserDirect(userToChat: UserDataInterface): Observable<UserDataInterface> {
    const userChat = collection(this.firestore, 'directChat');
    return from(addDoc(userChat, userToChat)).pipe(
      map((docRef) => {
        const newChatToUser: UserDataInterface = {
          ...userToChat,
          id: docRef.id,
        };
        return newChatToUser;
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
