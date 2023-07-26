import { Component, OnInit } from '@angular/core';
import { ChatExtendService } from '../service-moduls/chat-extend.service';
import { Observable } from 'rxjs';
import { ChannelDataInterface } from '../service-moduls/channel-data.service';

@Component({
  selector: 'app-chat-extend',
  templateUrl: './chat-extend.component.html',
  styleUrls: ['./chat-extend.component.scss']
})
export class ChatExtendComponent implements OnInit {
  receivedChannelData$!: Observable<ChannelDataInterface | null>;

  constructor(private chatExtendService: ChatExtendService) { }

  ngOnInit(): void {
    this.chatExtendService.getDataFromChannel();
    this.receivedChannelData$ = this.chatExtendService.receivedChannelData$;
  }
}
