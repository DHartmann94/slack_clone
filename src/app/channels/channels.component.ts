import { Component, OnInit } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { Firestore, addDoc, collection, getDocs, query } from '@angular/fire/firestore';

/* interface ChannelInterface {
  channelName: string;
  channelDescription: string;
}
 */
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

  channelForm!: FormGroup;
  userForm!: FormGroup;

  showFiller: boolean = true;
  openChannels: boolean = true;
  channelCard: boolean = false;
  userCard: boolean = true;

  userData: UserDataInterface[] = [];


  constructor(
    private firestore: Firestore,
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
    this.channelForm = this.fb.group({
      channelName: ['',[Validators.required]],
      channelDescription: ['']
    });
    this.userForm = this.fb.group({
      userName: ['',[Validators.required]]
    });
  }

  toggle() {
    this.showFiller = !this.showFiller;
  }

  toggleChannel() {
    this.openChannels = !this.openChannels;
  }

  addChannel() {
    this.channelCard = true;
  }

  async submitChannel() {
    if(this.channelForm) {
      const channelCollection = collection(this.firestore, 'channels');
      await addDoc(channelCollection, this.channelForm.value);
      this.clearChannelForm();
      this.channelCard = false;
    }
  }

  clearChannelForm() {
    this.channelForm.reset();
  }

  close() {
    this.channelCard = false;
  }

  submitUser() {
    if(this.channelForm != null) {

    }
  }
}
