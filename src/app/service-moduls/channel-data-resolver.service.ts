import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChannelDataInterface } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataResolverService {
  private dataSubjectChannel = new BehaviorSubject<ChannelDataInterface | null>(null);
  
  sendDataChannels(data: ChannelDataInterface | null) {
    this.dataSubjectChannel.next(data);
  }

  resolve(): Observable<ChannelDataInterface | null> {
    return this.dataSubjectChannel.asObservable();
  }
}
