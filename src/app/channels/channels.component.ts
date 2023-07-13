import { Component, OnInit } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel-data.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, addDoc, arrayUnion, collection, doc, updateDoc } from '@angular/fire/firestore';

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

  showFiller: boolean = true;
  openChannels: boolean = true;
  channelCard: boolean = false;
  userCard: boolean = false;
  openUserForm: boolean = false;

  userData: UserDataInterface[] = [];
  channelData: ChannelDataInterface[] = [];

  channelId: string = '';
  userSubscriptionId: string = '';

  constructor(
    private firestore: Firestore,
    private userDataService: UserDataService,
    private channelDataService: ChannelDataService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.channelForm = this.fb.group({
      channelName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      channelDescription: ['']
    });
    this.getChannelData();
    this.getUserData();
  }

  async getUserData() {
    this.userDataService.getUserData().subscribe(
      userData => {
        this.userData = userData;
        console.log('Subscribed data users:', userData);
      },
      error => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  async getChannelData() {
    if (this.openChannels !== null) {
      try {
        this.channelDataService.getChannelData().subscribe(
          channelData => {
            this.channelData = channelData;
            console.log('Subscribed data channels:', channelData);
          },
          error => {
            console.error('Error retrieving user data:', error);
          }
        );
      } catch (error) {
        console.log('Error logging in:', error);
      }
    }
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
    if (this.channelForm) {
      const channel: ChannelDataInterface = {
        channelName: this.channelForm.value.channelName,
        channelDescription: this.channelForm.value.channelDescription,
        userName: '',
        color: this.newColor(),
      };

      const channelCollection = collection(this.firestore, 'channels');
      const docRef = await addDoc(channelCollection, channel);
      this.channelId = docRef.id;
      console.log(this.channelId);

      this.channelForm.reset();
      this.channelCard = false;
      this.userCard = true;
    }
  }

  close() {
    this.channelCard = false;
  }

  addUser(value: string) {
    if (value === 'addByUser') {
      this.openUserForm = true;
    } else if (value === 'addFromGroup') {
      this.openUserForm = false;
    }
  }

  async submitUserToChannel() {
    if (this.channelForm && this.channelId) {
      const users: string[] = [];
      users.push(this.channelForm.value.userName);
      console.log(users);

      try {
        const channelDoc = doc(this.firestore, 'channels', this.channelId);
        await updateDoc(channelDoc, {
          users: arrayUnion(...users)
        });
        console.log('User added successfully.');
      } catch (error) {
        console.error('Error adding user:', error);
      }
      
      this.channelForm.reset();
      this.userCard = false;
    }
  }

  newColor() {
    var randomColor = "#000000".replace(/0/g, () => {
      return (~~(Math.random() * 16)).toString(16);
    });
    return randomColor;
  }

}
