import { Component, OnInit } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss'],
  animations: [
    trigger('cardWidth', [
      state('closed', style({
        width: '0',
      })),
      state('open', style({
        width: '300px',
      })),
      transition('closed <=> open', animate('0.5s ease')),
    ]),
  ],
})

export class ChannelsComponent implements OnInit {

  createChannel!: FormGroup
  showFiller: boolean = true;

  channelCard: boolean = false;

  userData: UserDataInterface[] = [];

  constructor(
    private userDataService: UserDataService,
    private fb: FormBuilder,
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

  close() {
    this.channelCard = false;
  }
}
