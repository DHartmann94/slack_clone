import { Injectable } from '@angular/core';
import { user } from '@angular/fire/auth';
import { DocumentData, Firestore, QuerySnapshot, arrayUnion, collection, doc, getDocs, query, updateDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface ChannelDataInterface {
  channelName: string;
  channelDescription: string;
  userName?: string;
  color?: any;
}

@Injectable({
  providedIn: 'root'
})

export class ChannelDataService {

  channelData: ChannelDataInterface[] = [];

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
          const { channelName, channelDescription } = data;
          const channel: ChannelDataInterface = {
            channelName: channelName,
            channelDescription: channelDescription,
          };
          storedUserData.push(channel);
        });

        this.channelData = storedUserData;
        return storedUserData;
      })
    )
  }
}
