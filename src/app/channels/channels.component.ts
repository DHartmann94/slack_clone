import { Component, OnInit } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel-data.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, addDoc, arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

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
  openDirect: boolean = true;
  channelCard: boolean = false;
  userCard: boolean = false;
  openUserForm: boolean = false;

  userData: UserDataInterface[] = [];
  channelData: ChannelDataInterface[] = [];

  channelId: string = '';
  selectedUserType: string = '';
  selectedChannel: ChannelDataInterface | null = null;

  constructor(
    private firestore: Firestore,
    private userDataService: UserDataService,
    private channelDataService: ChannelDataService,
    private fbChannel: FormBuilder,
    private fbUser: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.channelForm = this.fbChannel.group({
      channelName: ['', [Validators.required]],
      channelDescription: ['', [Validators.required]],
    });
    this.userForm = this.fbUser.group({
      userName: ['', [Validators.required]],
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

  toggleDirect() {
    this.openDirect = !this.openDirect;
  }

  addChannel() {
    this.channelCard = true;
  }

  selectChannel(channelId: any) {
    this.selectedChannel = this.getChannelById(channelId);
    console.log(this.selectedChannel);
  }

  getChannelById(channelId: any) {
    return this.channelData.find(channel => channel.id === channelId) || null;
  }

  newColor() {
    var randomColor = "#000000".replace(/0/g, () => {
      return (~~(Math.random() * 16)).toString(16);
    });
    return randomColor;
  }

  async submitChannel() {
    if (this.channelForm.valid) {
      const channel: ChannelDataInterface = {
        channelName: this.channelForm.value.channelName,
        channelDescription: this.channelForm.value.channelDescription,
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
    this.selectedUserType = value;
    if (value === 'addByUser') {
      this.openUserForm = true;
    } else if (value === 'addFromGroup') {
      this.openUserForm = false;
    }
  }

  async submitUserToChannel() {
    if (this.userForm.valid && this.channelId) {
      const userName = this.userForm.value.userName;

      try {
        const userData = await firstValueFrom(this.userDataService.getUserData());
        const matchingUser = userData.find(user => user.name === userName);
  
        if (matchingUser) {
          if (this.selectedUserType === 'addFromGroup') {
            this.addGroupToChannel(matchingUser);
          } else {
            const users: string[] = [matchingUser.id];
            await this.addUserToChannel(users, userName);
          }
        } else {
          console.log('User not found.');
        }
      } catch (error) {
        console.error('Error adding user:', error);
      }
      this.userForm.reset();
      this.userCard = false;
    }
  }

  async addUserToChannel(users: string[], userName: string) {
    try {
      const channelDoc = doc(this.firestore, 'channels', this.channelId);
      const filteredUsers = users.filter(user => user !== userName);
      console.log(filteredUsers);
      await updateDoc(channelDoc, {
        users: arrayUnion(...filteredUsers)
      });
      console.log('User added successfully.');
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }

  async addGroupToChannel(matchingUser: UserDataInterface) {
    try {
      const channelDoc = doc(this.firestore, 'channels', this.channelId);
      const channelData = await firstValueFrom(this.channelDataService.getChannelData());
      const matchingChannel = channelData.find(channel => channel.id === this.selectedChannel?.id);
  
      if (matchingChannel && matchingChannel.users) {
        const usersToAdd = matchingChannel.users.filter((user: string) => user !== matchingUser.id);
        console.log("The users should be added", usersToAdd);
        await updateDoc(channelDoc, {
          users: arrayUnion(...usersToAdd)
        });
  
        console.log('Users added successfully.');
      } else {
        console.log('Channel or users not found.');
      }
    } catch (error) {
      console.error('Error adding users:', error);
    }
    this.userCard = false;
  }
}
