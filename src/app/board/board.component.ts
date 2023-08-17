import { Component, OnInit } from '@angular/core';
import {ThreadDataInterface, ThreadDataService} from "../service-moduls/thread.service";
<<<<<<< HEAD
import { ThreadDirectDataInterface, ThreadDirectService } from '../service-moduls/thread-direct.service';
=======
import { DirectMessageToUserInterface, DirectMessageToUserService } from '../service-moduls/direct-message-to-user.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
>>>>>>> 9eec681e233f83a9db65b68ad8d710fcfd573de9

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})

export class BoardComponent implements OnInit {
  

  constructor(
<<<<<<< HEAD
    public threadDataService: ThreadDataService,
    public threadDirectDataService: ThreadDirectService,
  ) { }
=======
    public threadDataService: ThreadDataService, 
    public directMessageToUserService: DirectMessageToUserService,
    public chatBehaviorService: ChatBehaviorService,
    
    ) { }


  
>>>>>>> 9eec681e233f83a9db65b68ad8d710fcfd573de9

  ngOnInit(): void {
    
  }
}
