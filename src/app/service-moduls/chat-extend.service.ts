import { Injectable } from '@angular/core';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';
import { Observable } from 'rxjs';
import { ChannelDataInterface } from '../service-moduls/channel-data.service';

@Injectable({
  providedIn: 'root'
})
export class ChatExtendService {
  receivedChannelData$!: Observable<ChannelDataInterface | null>;

  constructor(private channelDataResolver: ChannelDataResolverService) { }

  async getDataFromChannel(): Promise<void> {
    this.receivedChannelData$ = this.channelDataResolver.resolve();
    this.receivedChannelData$.subscribe(
      (data: ChannelDataInterface | null) => {
        console.log('Received data in ChatExtendService:', data);
      },
      (error) => {
        console.error('Error receiving data:', error);
      }
    );
  }
}
