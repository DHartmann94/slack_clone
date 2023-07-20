import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChannelDataInterface } from './channel-data.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataResolverService {
  private dataSubject = new BehaviorSubject<ChannelDataInterface | null>(null);

  sendData(data: ChannelDataInterface | null) {
    this.dataSubject.next(data);
  }

  resolve(): Observable<ChannelDataInterface | null> {
    return this.dataSubject.asObservable();
  }
}
