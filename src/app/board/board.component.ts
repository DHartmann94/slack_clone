import { Component, OnInit } from '@angular/core';
import { ThreadDataInterface, ThreadDataService} from "../service-moduls/thread.service";
import { ThreadDirectDataInterface, ThreadDirectService } from '../service-moduls/thread-direct.service';
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
    public threadDirectDataService: ThreadDirectService,
    public directMessageToUserService: DirectMessageToUserService,
    public directMessageService: DirectMessageService,
    public chatBehaviorService: ChatBehaviorService,
  ) { }

  ngOnInit(): void {
    
  }
}
