import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, addDoc, collection, getDocs, onSnapshot, query } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, map } from 'rxjs';

export interface ChannelDataInterface {
  id?: any;
  channelName: string;
  channelDescription: string;
  color?: any;
  users?: any;
}

@Injectable({
  providedIn: 'root'
})

export class ChannelDataService {

  private channelDataSubject: BehaviorSubject<ChannelDataInterface[]> = new BehaviorSubject<ChannelDataInterface[]>([]);
  public channelData$: Observable<ChannelDataInterface[]> = this.channelDataSubject.asObservable();

  channelData: ChannelDataInterface[] = [];
  users: string | undefined;

  constructor(
    public firestore: Firestore
  ) { }

  getChannelData(): Observable<ChannelDataInterface[]> {
    const channelCollection = collection(this.firestore, 'channels');
    const q = query(channelCollection);

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        const storedUserData: ChannelDataInterface[] = [];

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const { channelName, channelDescription, color, users } = data;
          const channel: ChannelDataInterface = {
            id: doc.id,
            channelName: channelName,
            channelDescription: channelDescription,
            color: color,
            users: users,
          };
          storedUserData.push(channel);
        });
        this.channelData = storedUserData;
        return storedUserData;
      })
    )
  }

  sendChannelData(channel: ChannelDataInterface): Observable<void> {
    const channels = collection(this.firestore, 'channels');
    const channelData = {
      id: channel.id,
      channelName: channel.channelName,
      channelDescription: channel.channelDescription,
      color: channel.color,
      users: channel.users,
    };

    return from(addDoc(channels, channelData)).pipe(
      map(() => {
        console.log('Message sent');
      })
    );
  } 

  subscribeToChannel() {
    const channelCollection = collection(this.firestore, 'channels');
    const q = query(channelCollection);

    onSnapshot(q, (querySnapshot) => {
      const storedUserData: ChannelDataInterface[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const { channelName, channelDescription, color, users } = data;
        const channel: ChannelDataInterface = {
          id: doc.id,
          channelName: channelName,
          channelDescription: channelDescription,
          color: color,
          users: users,
        };
        storedUserData.push(channel);
      });
      this.channelDataSubject.next(storedUserData);
    });
  }
}
