import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel-data.service';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';

@Component({
  selector: 'app-chat-extend',
  templateUrl: './chat-extend.component.html',
  styleUrls: ['./chat-extend.component.scss']
})
export class ChatExtendComponent implements OnInit {
  receivedChannelData$!: Observable<ChannelDataInterface | null>;

  openNewChat: boolean = false;

  constructor(
    private ChannelDataResolver: ChannelDataResolverService,
    private channelDataService: ChannelDataService,
  ) { }

  ngOnInit() {
    this.getDataFromChannel();
  }

  getDataFromChannel(): void {
    this.receivedChannelData$ = this.ChannelDataResolver.resolve();
    this.receivedChannelData$.subscribe(
      (data: ChannelDataInterface | null) => {
        console.log('Received data in ChatComponent:', data);
      },
      (error) => {
        console.error('Error receiving data:', error);
      }
    );
  }

}
