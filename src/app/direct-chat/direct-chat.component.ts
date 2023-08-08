import { Component, OnInit } from '@angular/core';
import { UserDataResolveService } from '../service-moduls/user-data-resolve.service';
import { Observable } from 'rxjs';
import { UserDataInterface } from '../service-moduls/user.service';
import { MessageDataInterface } from '../service-moduls/message.service';

@Component({
  selector: 'app-new-chat',
  templateUrl: './direct-chat.component.html',
  styleUrls: ['./direct-chat.component.scss']
})
export class DirectChatComponent implements OnInit {

  messageData: MessageDataInterface[] = [];
  receivedUserData$!: Observable<UserDataInterface | null>;

  ngOnInit(): void {
    this.getDataFromChannel();
  }

  constructor(
    private userDataResolver: UserDataResolveService,
  ) {}

  async getDataFromChannel(): Promise<void> {
    this.receivedUserData$ = this.userDataResolver.resolve().pipe();
    this.receivedUserData$.subscribe(
      (userData: UserDataInterface | null) => {
        console.log("User received from channel: ", userData);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    ); 
  }
}
