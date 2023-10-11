import { Component, OnInit } from '@angular/core';
import { ThreadDataService } from "../service-moduls/thread.service";
import { DirectMessageToUserService } from '../service-moduls/direct-message-to-user.service';
import { DirectMessageService } from '../service-moduls/direct-message.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset,'(max-width: 1380px)']).subscribe(result => {
      this.chatBehavior.isResponsive = result.matches;
    });
  }

  toggleDirectChatMobile() {
    this.chatBehavior.triggerChat();
    if (this.chatBehavior.toggleDirectChatIcon) {
      this.chatBehavior.hideChannel = true;
      this.chatBehavior.hideChat = false;
      this.chatBehavior.hideDirectChat = false;
      this.chatBehavior.headerMoblieView = true;
      this.chatBehavior.toggleDirectChatIcon = false;
      this.chatBehavior.toggleSearchBar === true;
    }
  }
}
