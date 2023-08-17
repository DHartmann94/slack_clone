import { Component, OnInit } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user.service';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel.service';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';
import { UserDataResolveService } from '../service-moduls/user-data-resolve.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, addDoc, arrayUnion, collection, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { DirectMessageToUserService } from '../service-moduls/direct-message-to-user.service';

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
  ChannelChatisOpen: boolean = true;
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
  selectedUser: UserDataInterface | null = null;

  constructor(
    private firestore: Firestore,
    private userDataService: UserDataService,
    private channelDataService: ChannelDataService,
    private channelDataResolver: ChannelDataResolverService,
    private userDataResolver: UserDataResolveService,
    private chatBehavior: ChatBehaviorService,
    private fbChannel: FormBuilder,
    private fbUser: FormBuilder,
    public directMessageToUserService: DirectMessageToUserService,
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
    this.updateUsers();
  }

  async getUserData() {
    this.userDataService.getUserData().subscribe(
      userData => {
        this.userData = userData;
        /* console.log('Subscribed data users:', userData); */
      },
      error => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  async updateUsers() {
    const collectionUsersRef = collection(this.firestore, 'users');
    onSnapshot(collectionUsersRef, (snapshot) => {
      this.getUserData();
    });
  }

  async getChannelData() {
    this.channelDataService.getChannelData().subscribe(
      channelData => {
        this.channelData = channelData;
        if (this.channelData.length > 0) {
          this.selectedChannel = this.channelData[0];
          this.channelDataResolver.sendDataChannels(this.selectedChannel);
        }
        console.log('Subscribed data channels:', channelData);
      },
      error => {
        console.error('Error retrieving user data:', error);
      }
    );
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
    this.channelDataResolver.sendDataChannels(this.selectedChannel);
    this.updateChannelName(this.selectedChannel);
    this.directMessageToUserService.directMessageToUserOpen = false;
    this.chatBehavior.ChannelChatIsOpen = true;
  }

  selectUser(userId: any) {
    this.selectedUser = this.getUserById(userId);
    this.userDataResolver.sendDataUsers(this.selectedUser);
  }

  selectChannelFromList(channelGroupId: any) {
    this.selectedChannel = this.getChannelById(channelGroupId);
  }

  triggerDirectChat() {
    this.chatBehavior.triggerCRUD();
  }

  getChannelById(channelId: any) {
    return this.channelData.find(channel => channel.id === channelId) || null;
  }

  getUserById(userId: any) {
    return this.userData.find(user => user.id === userId) || null;
  }

  updateChannelName(channelToUpdate: any) {
    if (channelToUpdate && channelToUpdate.channelName) {
      const channelIndex = this.channelData.findIndex(channel => channel.id === channelToUpdate.id);
      if (channelIndex !== -1) {
        this.channelData[channelIndex].channelName = channelToUpdate.channelName;
      }
    }
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
      this.channelDataService.addChannelData(channel).subscribe(
        (docId) => {
          this.channelId = docId;
          this.channelData.push(channel);
          console.log('Channel created with ID:', docId);
        },
        (error) => {
          console.error('Error creating channel:', error);
        }
      );
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
    console.log("type", this.selectedUserType);
  }

  async submitUserToChannel() {
    if (this.userForm.valid && this.channelId) {
      try {
        const userName = this.userForm.value.userName;
        const userData = await firstValueFrom(this.userDataService.getUserData());
        const matchingUser = userData.find(user => user.name === userName);

        if (!(matchingUser && this.selectedUserType === 'addByUser')) {
          console.log('User not found.');
          return
        }
        const users: string[] = [matchingUser.id];
        await this.addUserToChannel(users, userName);
      } catch (error) {
        console.error('Error adding user:', error);
      } finally {
        this.userForm.reset();
        this.userCard = false;
      }
    }

    if (this.selectedChannel) {
      try {
        const matchingChannelFromList = this.selectedChannel;
        const users = matchingChannelFromList.users;
        console.log("User can be added", users);
        if (!(matchingChannelFromList && this.selectedUserType === 'addFromGroup')) {
          console.log('User not found.');
          return;
        }
        const userGroup: string[] = users;
        console.log(userGroup);
        await this.addGroupToChannel(userGroup)
      } catch (error) {
        console.error('Error adding user:', error);
      }
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

  async addGroupToChannel(userGroup: string[]) {
    try {
      const channelDoc = doc(this.firestore, 'channels', this.channelId);
      const usersToAdd = userGroup;
      await updateDoc(channelDoc, {
        users: arrayUnion(...usersToAdd)
      });
      console.log('Users added successfully.');
    } catch (error) {
      console.error('Error adding users:', error);
    }
    this.userCard = false;
  }

  openDirectMessageToUser() {
    this.directMessageToUserService.setDirectMessageToUserId();
    this.chatBehavior.ChannelChatIsOpen = false;
  
  }

  // openDirectMessageToUser(//DirectMessageToUserID: string) {
  //   this.directMessageToUserService.setDirectMessageToUserId(//DirectMessageToUserID);
  // }

}



