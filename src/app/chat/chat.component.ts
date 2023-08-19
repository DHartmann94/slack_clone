import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MessageDataService, MessageDataInterface } from '../service-moduls/message.service';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';
import { UserDataResolveService } from '../service-moduls/user-data-resolve.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserDataService, UserDataInterface } from '../service-moduls/user.service';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel.service';
import { ThreadDataInterface, ThreadDataService } from '../service-moduls/thread.service';
import { Firestore, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { EmojiService } from '../service-moduls/emoji.service';

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
  receivedUserData$!: Observable<UserDataInterface | null>

  userData: UserDataInterface[] = [];
  messageData: MessageDataInterface[] = [];
  channelData: ChannelDataInterface[] = [];
  threadData: ThreadDataInterface[] = [];

  userProfile: UserDataInterface[] = [];

  mentionUser = new FormControl('');
  userList: string[] = [];

  selectedMessage: MessageDataInterface | null = null;
  currentChannelData: ChannelDataInterface | null = null;

  channelId: string = "";

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

  private chatTriggerSubscription!: Subscription;
  triggerNewChatWindow: boolean = true;

  inviteUserOrChannel!: string;
  searchResults: UserDataInterface[] = [];

  isInviteUserOpen: boolean = false;
  toggleList: boolean = false;
  userSendToChannel: boolean = false;
  inviteUserToChannel: string = '';
  searchUserResults: UserDataInterface[] = [];
  selectedUserToChannel: UserDataInterface[] = [];

  constructor(
    private messageDataService: MessageDataService,
    public emojiService: EmojiService,
    public userDataService: UserDataService,
    private channelDataService: ChannelDataService,
    private channelDataResolver: ChannelDataResolverService,
    private userDataResolver: UserDataResolveService,
    private chatBehavior: ChatBehaviorService,
    private fbChannelName: FormBuilder,
    private fbChannelDescription: FormBuilder,
    private threadDataService: ThreadDataService,
    private firestore: Firestore,
  ) {
    this.chatTriggerSubscription = this.chatBehavior.crudTriggered$.subscribe(() => {
      this.toggleDirectChat();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes here', this.sentByName)
  }

  ngOnInit(): void {
    this.userDataService.userName = this.currentUser;
    this.channelName = this.fbChannelName.group({
      channelName: ['', [Validators.required]],
    });
    this.channelDescription = this.fbChannelDescription.group({
      channelDescription: ['', [Validators.required]],
    });
    this.getDataFromChannel();
    this.getUserData();
    this.getCurrentUserId();
    this.compareIds();
    this.deleteUserFromChannel();
    this.getThreadData();
  }

  ngOnDestroy() {
    this.chatTriggerSubscription.unsubscribe();
  }

  async getUserData() {
    this.userDataService.getUserData().subscribe(
      (userData: UserDataInterface[]) => {
        this.userData = userData;
        this.userList = userData.map(user => user.name);
        console.log('Subscribed data users:', userData);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  async getDataFromChannel(): Promise<void> {
    this.receivedChannelData$ = this.channelDataResolver.resolve().pipe(
      map((data: ChannelDataInterface | null) => {
        if (data && data.id) {
          this.processChannelData(data.id);
        }
        return data;
      })
    );
    this.receivedUserData$ = this.userDataResolver.resolve();
    this.receivedUserData$.subscribe(
      (userData: UserDataInterface | null) => {
        console.log("User received from channel: ", userData);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  }


  async getThreadData() {
    this.threadDataService.getThreadDataMessages().subscribe(
      (threadData: ThreadDataInterface[]) => {
        this.threadData = threadData;
        console.log("Get thread data", threadData);
      },
      (error) => {
        console.error('Error fetching thread data:', error);
      }
    );
  }

  toggleDirectChat() {
    this.triggerNewChatWindow = !this.triggerNewChatWindow;
  }

  selectMessage(messageId: any) {
    this.selectedMessage = this.getMessageId(messageId);
    console.log(this.selectedMessage);
  }

  getMessageId(messageId: any) {
    return this.messageData.find(message => message.id === messageId) || null;
  }

  processChannelData(channelId: string) {
    this.channelId = channelId;
    this.renderChatByChannelId(this.channelId);
  }

  renderChatByChannelId(channel: string) {
    if (channel) {
      this.messageDataService.getMessageData().subscribe(
        (messageData: MessageDataInterface[]) => {
          const messagesForChannel = messageData.filter(message => message.channel === channel);
          if (messagesForChannel.length > 0) {
            const filteredData = messagesForChannel.filter((message) => message.time !== undefined && message.time !== null);
            const sortDataAfterTime = filteredData.sort((a, b) => a.time! > b.time! ? 1 : -1);
            console.log('Messages to Render:', sortDataAfterTime);
            this.messageData = sortDataAfterTime;
          } else {
            console.log('No messages found:', channel);
            this.messageData = [];
          }
        },
        (error) => {
          console.error('ERROR render messages in channel:', error);
        }
      );
    } else {
      this.messageData = [];
    }
  }

  getCurrentUserId() {
    this.currentUserId = this.userDataService.currentUser;
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
    currentMessage: MessageDataInterface,
    previousMessage: MessageDataInterface
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
      const threadId = this.threadDataService.generateThreadId();
      const message: MessageDataInterface = {
        messageText: this.messageInput,
        sentById: this.currentUserId,
        time: Date.now(),
        emojis: [],
        thread: threadId,
        channel: this.channelId,
        mentionedUser: 'user_id_here',
      };

      if (this.emojipickeractive) {
        this.emojiService.toggleEmojiPicker('chat');
      }

      this.messageData.push(message);
      this.messageInput = [''];
      this.messageDataService.sendMessage(message).subscribe(
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


  reactWithEmoji(emoji: string, index: number, messageId: string, message: MessageDataInterface) {
    let emojiArray = message.emojis;

    emojiArray.forEach((emoj: { [x: string]: any[]; }) => {
      if (emoj['reaction-from'].includes(this.userDataService.userName)) {
        const userIndex = emoj['reaction-from'].indexOf(this.userDataService.userName);
        emoj['reaction-from'].splice(userIndex, 1);
      }
    });

    if (this.emojiService.existEmoji(index, emoji, this.messageData)) {

      let indexWithTypedEmoji = emojiArray.findIndex((em: { [x: string]: string; }) => em['emoji'] === emoji);
      emojiArray[indexWithTypedEmoji]['reaction-from'].push(this.userDataService.userName);
    } else {
      emojiArray.push({ 'emoji': emoji, 'reaction-from': [this.userDataService.userName] });
    }

    let indexWithEmojiToDelete = emojiArray.findIndex((em: { [x: string]: string; }) => em['reaction-from'].length == 0);
    if (indexWithEmojiToDelete != -1) {
      emojiArray.splice(indexWithEmojiToDelete, 1);
    }

    console.log('my Emoji Array', emojiArray);

    this.messageDataService.updateMessage(messageId, emojiArray);
    this.emojisClickedBefore = undefined;
    this.reactionListOpen = false;
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
    //this.userDataService.getCurrentUserData(id);
    this.userProfile = [];
    if (id) {
      this.userProfile = this.userDataService.userData.filter(user => user.id.includes(id));
    }
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
      this.editChannelName = false;
    }
  }

  saveChangesToChannelDescription() {
    if (this.channelDescription.valid && this.currentChannelData) {
      const newChannelDescription: string = this.channelDescription.value.channelDescription;
      this.currentChannelData.channelDescription = newChannelDescription;
      this.channelDataService.sendChannelData(this.currentChannelData).subscribe(
        () => {
          console.log('Channel description updated successfully.');
        },
        (error) => {
          console.error('Error updating channel name:', error);
        }
      );
      this.channelDescription.reset();
      this.editChannelDescription = false;
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  async compareIds() {
    this.messageDataService.messageData$.subscribe(
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
            messages.forEach(() => {
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
      this.messageDataService.deleteMessage(messageId);
      this.messageData = this.messageData.filter(message => message.id !== messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  openThread(threadID: string) {
    this.threadDataService.setThreadId(threadID);
  }

  /*------ Invite User To Channel ------*/
  searchUser(): void {
    if (this.inviteUserToChannel) {
      const searchBy = this.inviteUserToChannel.toLowerCase();
      const userName = searchBy.substr(1);
      this.searchUserResults = this.userDataService.userData.filter(user =>
        user.name.toLowerCase().includes(userName) &&
        !this.selectedUserToChannel.some(selectedUser => selectedUser.name === user.name)
      );
      this.toggleList = true;
    } else {
      this.searchUserResults = [];
    }
  }

  selectUserToChannel(user: UserDataInterface): void {
    if (user) {
      this.selectedUserToChannel.push(user);
      this.inviteUserToChannel = '';
      this.toggleList = false;
    }
  }

  deleteSelectedUser(user: any) {
    const index = this.selectedUserToChannel.indexOf(user);
    if (index !== -1) {
      this.selectedUserToChannel.splice(index, 1);
    }
  }

  async sendUserToChannel() {
    if (this.selectedUserToChannel) {
      this.userSendToChannel = true;
      const selectedUserIds: string[] = this.selectedUserToChannel.map(user => user.id);

      const channelDoc = doc(this.firestore, 'channels', this.channelId);
      try {
        const channelSnapshot = await getDoc(channelDoc);
        const existingUserIds = await channelSnapshot.get('users') || [];

        const newUserIds = selectedUserIds.filter(userId => !existingUserIds.includes(userId));

        const updatedUserIds = [...existingUserIds, ...newUserIds];

        await updateDoc(channelDoc, { users: updatedUserIds });
        this.resetInviteVariables();
      } catch (error) {
        console.error('ERROR invite user to channel', error);
      }
    }
  }

  resetInviteVariables() {
    this.selectedUserToChannel = [];
    this.userSendToChannel = false;
    this.isInviteUserOpen = false;
  }

  openInviteUserToChannel() {
    this.isInviteUserOpen = !this.isInviteUserOpen;
  }

  closeInviteUserToChannel() {
    this.isInviteUserOpen = false;
  }

}
