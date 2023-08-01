import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ChatService, MessageInterface } from '../service-moduls/chat.service';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { Observable, firstValueFrom, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel-data.service';
import { ThreadInterface, ThreadService } from '../service-moduls/thread.service';
import { Firestore, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { DirectChatInterface, DirectChatService } from '../service-moduls/direct-chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})

export class ChatComponent implements OnInit, OnChanges {
  typedEmoji: string = '';
  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];
  emojisClickedBefore: number | undefined;

  [x: string]: any;
  channelName!: FormGroup;
  channelDescription!: FormGroup;

  receivedChannelData$!: Observable<ChannelDataInterface | null>;
  userData: UserDataInterface[] = [];
  messageData: MessageInterface[] = [];
  channelData: ChannelDataInterface[] = [];
  directChatData: DirectChatInterface[] = [];
  threadData: ThreadInterface[] = [];

  /// new multiple selection option for mention users
  mentionUser = new FormControl('');
  userList: string[] = [];

  selectedMessage: MessageInterface | null = null;
  currentChannelData: ChannelDataInterface | null = null;

  messageInput: string[] = [];
  messageId: string = '';
  sentByName: string[] = [];
  usersFromUserData: string[] = [];
  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;
  currentUser: string = '';
  currentUserId: string = '';

  deleteUserFormChannel: any;

  editChannelName: boolean = false;
  editChannelDescription: boolean = false;
  openEditChannel: boolean = false;
  emojipickeractive = false;
  reactionListOpen = false;
  toggleUserList: boolean = true;

  private crudTriggeredSubscription: Subscription;
  triggerCRUDHTML: boolean = true;

  inviteUserOrChannel!: string;
  searchResults: UserDataInterface[] = [];

  constructor(
    private chatService: ChatService,
    private directChatService: DirectChatService,
    public userDataService: UserDataService,
    private channelDataService: ChannelDataService,
    private ChannelDataResolver: ChannelDataResolverService,
    private chatBehavior: ChatBehaviorService,
    private fbChannelName: FormBuilder,
    private fbChannelDescription: FormBuilder,
    private threadService: ThreadService,
    private firestore: Firestore,
  ) {
    this.crudTriggeredSubscription = this.chatBehavior.crudTriggered$.subscribe(() => {
      this.performCRUD();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes here', this.sentByName)
  }

  ngOnInit(): void {
    this.channelName = this.fbChannelName.group({
      channelName: ['', [Validators.required]],
    });
    this.channelDescription = this.fbChannelDescription.group({
      channelDescription: ['', [Validators.required]],
    });
    this.getChatData();
    this.getDataFromChannel();
    this.getUserData();
    this.getDirectChatData();
    this.chatService.subscribeToMessageUpdates();
    this.getCurrentUserId();
    this.compareIds();
    this.deleteUserFromChannel();
    this.threadService.getThreadData().subscribe((data) => {
      this.threadData = data.filter((thread) => thread.thread !== null);
    });
  }

  ngOnDestroy() {
    this.crudTriggeredSubscription.unsubscribe();
  }

  async getUserData() {
    this.userDataService.getUserData().subscribe(
      (userData: UserDataInterface[]) => {
        this.userData = userData; // Store all users in the component's userData array
        this.userList = userData.map(user => user.name); // Fill the userList array with user names
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  async getDataFromChannel(): Promise<void> {
    this.receivedChannelData$ = this.ChannelDataResolver.resolve();
    this.receivedChannelData$.subscribe(
      (data: ChannelDataInterface | null) => {
        console.log('Received data in ChatComponent:', data);
      },
      (error) => {
        console.error('Error receiving data:', error);
      }
    );
  }

  async getChatData() {
    this.chatService.getMessage().subscribe(
      (messageData) => {
        const filteredData = messageData.filter(
          (message) => message.time !== undefined && message.time !== null
        );
        this.messageData = filteredData.sort((a, b) =>
          a.time! > b.time! ? 1 : -1
        );
        console.log('Subscribed data users:', messageData);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  async getDirectChatData() {
    this.directChatService.getDirectMessages().subscribe(
      (directChatData: DirectChatInterface[]) => {
        this.directChatData = directChatData;
      },
      (error) => {
        console.error('Error fetching direct chat data:', error);
      }
    );
  }

  performCRUD() {
    this.triggerCRUDHTML = false;
  }

  selectMessage(messageId: any) {
    this.selectedMessage = this.getMessageId(messageId);
    console.log(this.selectedMessage);
  }

  getMessageId(messageId: any) {
    return this.messageData.find(message => message.id === messageId) || null;
  }

  searchUsers(): void {
    if (this.inviteUserOrChannel) {
      const searchBy = this.inviteUserOrChannel.toLowerCase();

      if (searchBy.startsWith('@')) {
        const userName = searchBy.substr(1);
        this.searchResults = this.userDataService.userData.filter(user =>
          user.name.toLowerCase().includes(userName)
        );
      } else {
        this.searchResults = this.userDataService.userData.filter(user =>
          user.email.toLowerCase().includes(searchBy)
        );
      }
    } else {
      this.searchResults = [];
    }
  }

  inviteUser(user: UserDataInterface): void {
    if (user) {
      this.directChatService.addUserToDirectChat(user).subscribe(
        (docId) => {
          console.log('User added to the chat with ID:', docId);
        },
        (error) => {
          console.error('Error adding user to the chat:', error);
        }
      );
    }
  }

  getCurrentUserId() {
    this.currentUserId = this.userDataService.currentUser;
    console.log('Current User is', this.currentUserId);
  }

  async deleteUserFromChannel() {
    await this.userDataService.getCurrentUserData(this.userDataService.currentUser);
    this.deleteUserFormChannel = this.userDataService.currentUser;
  }

  async leaveChannel() {
    if (this.deleteUserFormChannel && this.currentChannelData) {
      console.log("Im logged in", this.deleteUserFormChannel);
      try {
        const matchingChannel = this.currentChannelData.id;
        console.log(matchingChannel);
        if (matchingChannel) {
          const channelCollection = collection(this.firestore, 'channels');
          const channelDoc = doc(channelCollection, matchingChannel);
          const channelDocSnapshot = await getDoc(channelDoc);

          if (channelDocSnapshot.exists()) {
            const usersArray = channelDocSnapshot.data()['users'] || [];
            const updatedUsersArray = usersArray.filter((user: any) => user !== this.deleteUserFormChannel);
            await updateDoc(channelDoc, {
              users: updatedUsersArray
            });
            console.log("User removed from the channel.");
          } else {
            console.log("Matching channel not found.");
          }
        }
      } catch (error) {
        console.error('Error removing user:', error);
      }
    }
  }

  public typeEmoji($event: any): void {
    this.messageInput = this.messageInput + $event.character;
  }



  isNewDay(
    currentMessage: MessageInterface,
    previousMessage: MessageInterface
  ): boolean {
    if (!previousMessage) {
      return true;
    }

    const currentDate = new Date(currentMessage.time!);
    const previousDate = new Date(previousMessage.time!);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return (
      currentDate.getFullYear() !== previousDate.getFullYear() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getTime() === today.getTime() ||
      currentDate.getTime() === yesterday.getTime()
    );
  }

  async sendMessage() {
    if (this.messageInput.length > 0) {
      const message: MessageInterface = {
        messageText: this.messageInput,
        sentBy: this.currentUser,
        sentById: this.currentUserId,
        time: Date.now(),
        emojis: [],
        thread: null,
        channel: 'your_channel_value_here',
        mentionedUser: 'user_id_here',
      };

      if (this.emojipickeractive) {
        this.toggleEmojiPicker();
      }

      this.messageData.push(message);
      this.messageInput = [''];

      this.chatService.sendMessage(message).subscribe(
        (newMessage) => {
          if (newMessage && newMessage.id) {
            const index = this.messageData.findIndex((msg) => msg === message);
            if (index !== -1) {
              this.messageData[index].id = newMessage.id;
            }
          }
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
    } else {
      console.log('Message input is empty. Cannot send an empty message.');
    }
  }


  // *** EMOJI REACTION ***
  reaction(messageEmoji: string, index: number) {
    if (this.emojisClickedBefore === index) {
      document
        .getElementById(`reaction${this.emojisClickedBefore}`)
        ?.classList.remove('showEmojis');
      this.emojisClickedBefore = undefined;
    } else {
      if (this.emojisClickedBefore !== null) {
        document
          .getElementById(`reaction${this.emojisClickedBefore}`)
          ?.classList.remove('showEmojis');
      }
      document.getElementById(`reaction${index}`)?.classList.add('showEmojis');
      this.emojisClickedBefore = index;
    }
  }

  reactWithEmoji(emoji: string, index: number, messageId: string) {
    let emojiArray = this.messageData[index].emojis;
    if (this.existReaction(index)) {
      let indexWithCurrentUser = emojiArray.findIndex((reaction: { [x: string]: string; }) => reaction['reaction-from'] === this.currentUser);
      emojiArray[indexWithCurrentUser] = { 'emoji': emoji, 'reaction-from': this.currentUser };
    } else {
      emojiArray.push({ 'emoji': emoji, 'reaction-from': this.currentUser });
    }
    this.chatService.updateMessage(messageId, emojiArray);
    this.emojisClickedBefore = undefined;
    this.reactionListOpen = false;
  }


  existReaction(index: number): boolean {
    return this.messageData[index].emojis.some((reaction: { [x: string]: string; }) => {
      return reaction['reaction-from'] === this.currentUser;
    });
  }


  showReaction(index: number) {
    let item = document.getElementById(`reactionlist${index}`);
    this.messageData.forEach((message, i) => {
      let hideItems = document.getElementById(`reactionlist${i}`);
      hideItems?.classList.remove('show-list-of-reactions');
    });
    if (!this.reactionListOpen) {
      item?.classList.add('show-list-of-reactions');
      this.reactionListOpen = true;
    } else {
      this.reactionListOpen = false;
    }
  }
  //***** */



  toggleEmojiPicker() {
    this.emojipickeractive = !this.emojipickeractive;
  }

  editChannel() {
    this.openEditChannel = true;
    this.receivedChannelData$.subscribe((data: ChannelDataInterface | null) => {
      if (data) {
        this.currentChannelData = data;
      }
      console.log('Received Channel Data:', this.currentChannelData);
    });
  }

  openUserProfile(id: any) {
    this.isProfileCardOpen = true;
    this.isLogoutContainerOpen = false;
    this.userDataService.getCurrentUserData(id);
  }

  closeUserProfile() {
    this.isProfileCardOpen = false;
  }

  closeEditChannel() {
    this.openEditChannel = false;
  }

  updateChannelName() {
    this.editChannelName = true;
  }

  updateChannelDiscription() {
    this.editChannelDescription = true;
  }

  saveChangesToChannelName() {
    if (this.channelName.valid && this.currentChannelData) {
      console.log('Saving changes to channel', this.currentChannelData);
      const newChannelName: string = this.channelName.value.channelName;

      this.currentChannelData.channelName = newChannelName;
      this.channelDataService
        .sendChannelData(this.currentChannelData)
        .subscribe(
          () => {
            console.log('Channel name updated successfully.');
          },
          (error) => {
            console.error('Error updating channel name:', error);
          }
        );
      this.channelName.reset();
    }
  }

  saveChangesToChannelDescription() {
    if (this.channelDescription.valid && this.currentChannelData) {
      const newchannelDescription: string = this.channelDescription.value.channelDescription;
      this.currentChannelData.channelDescription = newchannelDescription;
      this.channelDataService.sendChannelData(this.currentChannelData).subscribe(
        () => {
          console.log('Channel description updated successfully.');
        },
        (error) => {
          console.error('Error updating channel name:', error);
        }
      );
      this.channelDescription.reset();
    }
  }

  formatTimeStamp(time: number | undefined): string {
    if (typeof time === 'undefined') {
      return 'N/A';
    }

    const dateObj = new Date(time);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const amOrPm = hours >= 12 ? 'pm' : 'am';

    return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
  }

  getFormattedDate(time: number | undefined): string {
    if (typeof time === 'undefined') {
      return '';
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00

    const messageDate = new Date(time);
    messageDate.setHours(0, 0, 0, 0); // Set time to 00:00:00

    if (messageDate.getTime() === currentDate.getTime()) {
      return 'Today';
    }

    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);

    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-US', {
      year: 'numeric', // Change to 'numeric' to display all four digits of the year
      month: 'long',
      day: 'numeric',
    });
  }


  async compareIds() {
    this.chatService.messageData$.subscribe(
      (messages) => {

        this.userDataService.getUserData().pipe(
          map((userData) => userData.map(user => user.id))
        ).subscribe(
          (userIds: string[]) => {

            const userIdToNameMap: { [id: string]: string } = {};
            this.userData.forEach(user => {
              if (userIds.includes(user.id)) {
                userIdToNameMap[user.id] = user.name;
              }
            });
            const matches: string[] = [];
            messages.forEach((message) => {
              if (this.currentUserId && userIdToNameMap.hasOwnProperty(this.currentUserId)) {
                const senderName = userIdToNameMap[this.currentUserId];
                matches.push(this.currentUserId);
                this.currentUser = senderName;
              }
            });
          }
        );
      }
    );
  }

  async deleteMessage(messageId: any) {
    if (!messageId) {
      return;
    }
    try {
      await this.chatService.deleteMessage(messageId);
      this.messageData = this.messageData.filter(message => message.id !== messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  openThread(messageId: string) {
    this.threadService.openThread(messageId);
  }
}
