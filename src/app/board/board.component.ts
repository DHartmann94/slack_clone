import { Component, OnInit } from '@angular/core';
import { ThreadDataInterface, ThreadDataService} from "../service-moduls/thread.service";
import { DirectMessageToUserInterface, DirectMessageToUserService } from '../service-moduls/direct-message-to-user.service';
import { DirectMessageInterface, DirectMessageService } from '../service-moduls/direct-message.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})

export class BoardComponent implements OnInit {
  hideChannel: boolean = false;
  hideChat: boolean = true;

  constructor(
    public threadDataService: ThreadDataService, 
    public directMessageToUserService: DirectMessageToUserService,
    public directMessageService: DirectMessageService,
    public chatBehaviorService: ChatBehaviorService,
    private chatBehavior: ChatBehaviorService,
  ) { }

  ngOnInit(): void {
    
  }

  toggleDirectChatMobile() {
    this.chatBehavior.triggerChat();
    this.hideChannel = !this.hideChannel;
    this.hideChat = !this.hideChat;
  }
}
