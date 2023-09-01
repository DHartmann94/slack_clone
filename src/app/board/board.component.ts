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
 
  constructor(
    public threadDataService: ThreadDataService, 
    public directMessageToUserService: DirectMessageToUserService,
    public directMessageService: DirectMessageService,
    public chatBehavior: ChatBehaviorService,
  ) { }

  ngOnInit(): void {

  }

  toggleDirectChatMobile() {
    this.chatBehavior.triggerChat();
    this.chatBehavior.hideChannel = !this.chatBehavior.hideChannel;
    this.chatBehavior.hideChat = !this.chatBehavior.hideChat;
    this.chatBehavior.headerMoblieView = true;
    this.chatBehavior.toggleDirectChat = !this.chatBehavior.toggleDirectChat;
    if (this.chatBehavior.toggleDirectChat) {
      this.chatBehavior.toggleSearchBar = true;  
    }
  }
}
