import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface ChannelDataInterface {
  id?: any;
  channelName: string;
  channelDescription: string;
  color: any;
  users?: any;
}

@Injectable({
  providedIn: 'root'
})

export class ChannelDataService {

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
          const { channelName, channelDescription, color, user } = data;
          const channel: ChannelDataInterface = {
            id: doc.id,
            channelName: channelName,
            channelDescription: channelDescription,
            color: color,
            users: user,
          };
          storedUserData.push(channel);
        });

        this.channelData = storedUserData;
        return storedUserData;
      })
    )
  }
}
