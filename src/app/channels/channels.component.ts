import { Component, OnInit } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss'],
})
export class ChannelsComponent implements OnInit {


  showFiller: boolean = true;

  userData: UserDataInterface[] = [];

  constructor(
    private userDataService: UserDataService
  ) { }

  ngOnInit(): void {
    this.userDataService.getUserData().subscribe(
      userData => {
        this.userData = userData;
        console.log('Subscribed data:', userData);
      },
      error => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  toggle() {
    this.showFiller = !this.showFiller;
  }
}
