import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel-data.service';
import { ChatDataResolverService } from '../service-moduls/chat-data-resolver.service';

@Component({
  selector: 'app-chat-extend',
  templateUrl: './chat-extend.component.html',
  styleUrls: ['./chat-extend.component.scss']
})
export class ChatExtendComponent implements OnInit {

  openChatCard: boolean = false;

  receivedChannelData$!: Observable<ChannelDataInterface | null>;

  ngOnInit(): void {
    this.getDataFromChannel();
  }

  constructor(
    private chatDataResolver: ChatDataResolverService,
    private channelDataService: ChannelDataService,
  ) { }

  getDataFromChannel(): void{
    this.receivedChannelData$ = this.chatDataResolver.resolve();
    this.receivedChannelData$.subscribe(
      (data: ChannelDataInterface | null) => {
        console.log('Received data in ChatExtendService:', data)
        this.openChatCard = data !== null;
      },
      (error) => {
        console.error('Error receiving data:', error);
      }
    );
  }
}
