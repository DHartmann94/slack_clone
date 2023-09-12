import { ScrollService } from './../service-moduls/scroll.service';
import { AfterViewChecked, Component, ElementRef, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { MessageDataService, MessageDataInterface } from '../service-moduls/message.service';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserDataService, UserDataInterface } from '../service-moduls/user.service';
import { UserDataResolveService } from '../service-moduls/user-data-resolve.service';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel.service';
import { ThreadDataInterface, ThreadDataService } from '../service-moduls/thread.service';
import { Firestore, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { EmojiService } from '../service-moduls/emoji.service';
import { DirectMessageToUserService } from '../service-moduls/direct-message-to-user.service';
import { MentionService } from '../service-moduls/mention.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})

export class ChatComponent implements OnInit, OnChanges, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild(MatMenuTrigger)
  trigger!: MatMenuTrigger;

  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];
  emojisClickedBefore: number | undefined;

  [x: string]: any;
  channelName!: FormGroup;
  channelDescription!: FormGroup;
  receivedChannelData$!: Observable<ChannelDataInterface | null>;

  userData: UserDataInterface[] = [];
  messageData: MessageDataInterface[] = [];
  channelData: ChannelDataInterface[] = [];
  threadData: ThreadDataInterface[] = [];
  availableChannels: ChannelDataInterface[] = [];
  userProfile: UserDataInterface[] = [];
  isInvitationValid: boolean = false;
  mentionUser = new FormControl('');
  userList: string[] = [];

  selectedUser: UserDataInterface | null = null;

  selectedMessage: MessageDataInterface | null = null;
  currentChannelData: ChannelDataInterface | null = null;
  selectedUserNameOrChannelName: string = '';

  messageInput: string[] = [];
  messageId: string = '';
  inputSearchId: any;
  inputSearchIdResults: string = '';
  channelId: string = "";
  sentByName: string[] = [];
  usersFromUserData: string[] = [];

  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;
  currentUser: string = '';
  currentUserId: string = '';
  toggleUserList: boolean = false;
  toggleChannelList: boolean = false;
  allLists: boolean = false;
  directMessageToUserOpen: boolean = false;

  deleteUserFormChannel: any;
  editChannelName: boolean = false;
  editChannelDescription: boolean = false;
  openEditChannel: boolean = false;
  emojipickeractive = false;
  reactionListOpen = false;
  dataIsLoading = false;
  mentionListOpen: boolean = false;

  private chatTriggerSubscription!: Subscription;

  inviteUserOrChannel!: string;
  searchResultsChannels: ChannelDataInterface[] = [];
  searchResultsUsers: UserDataInterface[] = [];
  closeSearchContainer: boolean = false;

  isInviteUserOpen: boolean = false;
  toggleList: boolean = false;
  userSendToChannel: boolean = false;
  inviteUserToChannel: string = '';
  searchUserResults: UserDataInterface[] = [];
  selectedUserToChannel: UserDataInterface[] = [];

  channelUserPicture: string[] = [];
  channelFromSearchResult: any;

  constructor(
    private messageDataService: MessageDataService,
    public emojiService: EmojiService,
    public mentionService: MentionService,
    public userDataService: UserDataService,
    private channelDataService: ChannelDataService,
    private channelDataResolver: ChannelDataResolverService,
    private userDataResolver: UserDataResolveService,
    public chatBehavior: ChatBehaviorService,
    private fbChannelName: FormBuilder,
    private fbChannelDescription: FormBuilder,
    private threadDataService: ThreadDataService,
    private firestore: Firestore,
    private scrollService: ScrollService,
    public directMessageToUserService: DirectMessageToUserService
  ) {
    this.chatTriggerSubscription = this.chatBehavior.crudTriggered$.subscribe(() => {
      this.toggleChat();
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
    this.updateUsersForMention();
    this.receivedChannelData$.pipe(
      switchMap(channelData => this.loadUserProfilePicture(channelData))
    ).subscribe();
  }

  ngAfterViewChecked(): void {
    this.schrollToBottom();
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

  toggleChat() {
    this.chatBehavior.toggleSearchBar = !this.chatBehavior.toggleSearchBar;
    this.inviteUserOrChannel = '';
    this.toggleUserList = false;
    this.toggleChannelList = false;
    this.closeSearchContainer = false;
  }

  filterUsers(): void {
    if (this.inviteUserOrChannel) {
      const searchBy = this.inviteUserOrChannel.toLowerCase();
      if (searchBy.startsWith('@')) {
        const userName = searchBy.substr(1);
        this.searchResultsUsers = this.userDataService.userData.filter(user =>
          user.name.toLowerCase().includes(userName)
        );
        this.toggleUserList = true;
        this.closeSearchContainer = true;
      } else if (this.inviteUserOrChannel && this.inviteUserOrChannel.startsWith('#')) {
        const channelName = this.inviteUserOrChannel.substr(1).toLowerCase();
        this.channelDataService.getChannelData().subscribe(
          (channelData: ChannelDataInterface[]) => {
            this.searchResultsChannels = channelData
              .filter(channel => channel.channelName.toLowerCase().includes(channelName))
              .filter(channel => channel.users.includes(this.userDataService.currentUser));
            this.searchResultsChannels.flatMap(channel =>
              channel.users.map((userId: string) =>
                this.userDataService.userData.find(user => user.id === userId)
              )
            );
          }
        );
        this.toggleChannelList = true;
        this.closeSearchContainer = true;
      } else {
        this.searchResultsUsers = this.userDataService.userData.filter(user =>
          user.email.toLowerCase().includes(searchBy)
        );
      }
    } else {
      this.searchResultsUsers = [];
      this.searchResultsChannels = [];
    }
  }

  inviteUser(user: UserDataInterface): void {
    if (user) {
      this.isInvitationValid = true;
      this.inputSearchId = user.id;
      this.selectedUserNameOrChannelName = user.name;
      this.toggleUserList = false;
      this.closeSearchContainer = false;
      this.inviteUserOrChannel = '';
    }
  }

  inviteChannel(channel: ChannelDataInterface): void {
    if (channel) {
      this.isInvitationValid = true;
      this.inputSearchId = channel.id;
      if (this.inputSearchId) {
        this.inputSearchIdResults = channel.channelName
        this.renderChatByChannelId(this.inputSearchId);
        this.sendMessage(this.inputSearchId);
      }
      this.selectedUserNameOrChannelName = channel.channelName;
      this.toggleChannelList = false;
      this.closeSearchContainer = false;
      this.inviteUserOrChannel = '';
    }
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
      const invitedChannelId = this.inputSearchId;
      console.log("Invited channel ID:", invitedChannelId);
      this.messageDataService.getMessageData().subscribe(
        (messageData: MessageDataInterface[]) => {
          const messagesForChannel = messageData.filter(message =>
            (message.channel && message.channel === channel) ||
            (message.channel === channel && message.channel)
          );
          if (invitedChannelId) {
            const messagesForInvitedUser = messageData.filter(message =>
              (message.channel && message.invitedChannelId === invitedChannelId) ||
              (message.channel === invitedChannelId && message.invitedChannelId)
            );
            messagesForChannel.push(...messagesForInvitedUser);
          }
          if (messagesForChannel.length > 0) {
            const filteredData = messagesForChannel.filter((message) => message.time !== undefined && message.time !== null);
            const sortDataAfterTime = filteredData.sort((a, b) => a.time! > b.time! ? 1 : -1);
            console.log('Messages to Render:', sortDataAfterTime);
            this.dataIsLoading = true;
            this.messageData = sortDataAfterTime;
          }
        },
        (error) => {
          console.error('ERROR rendering messages in channel:', error);
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

  isNewDay(currentMessage: MessageDataInterface, previousMessage: MessageDataInterface): boolean {
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

  async sendMessage(channel: ChannelDataInterface) {
    this.dataIsLoading = true;
    if (this.messageInput.length > 0 && this.messageInput[0].trim().length > 0) {
      const threadId = this.threadDataService.generateThreadId();
      const resultSearchingChannel = this.inputSearchId;
      console.log("Result invited channel",  resultSearchingChannel);
      const message: MessageDataInterface = {
        messageText: this.messageInput,
        sentById: this.currentUserId,
        time: Date.now(),
        emojis: [],
        thread: threadId,
        channel: this.channelId,
        mentionedUser: this.mentionService.mentionInMessage,
        invitedChannelId: resultSearchingChannel,
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
    this.mentionService.resetArray();
  }


  addMention(user: any) {
    if (!this.mentionService.chatToggledWithButton) {
      this.messageInput = this.messageInput.slice(0, -1);
    }
    this.mentionService.updateInputField(user);
  }

  updateUsersForMention() {
    this.receivedChannelData$.subscribe(data => {
      if (data && data.users) {
        this.mentionService.getUsers(data.users, this.userDataService.userName);
      }
    });
  }

  checkForMention(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    const lastCharacter = inputValue[inputValue.length - 1];
    if (lastCharacter === '@') {
      this.trigger.openMenu();
      this.mentionService.chatToggledWithButton = false;
    } else {
      this.trigger.closeMenu();
    }
  }

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
      console.log(this.userProfile);
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
    this.chatBehavior.isChatOpenResponsive = false;
    this.chatBehavior.isThreadOpenResponsive = true;
    this.chatBehavior.isDirectChatToUserOpenResponsive = false;

    this.threadDataService.setThreadId(threadID);
  }

  async loadUserProfilePicture(channelData: ChannelDataInterface | null) {
    this.channelUserPicture = [];
    if (channelData) {
      for (let i = 0; i < 3; i++) {
        const userId = channelData.users[i];
        const userData = await this.userDataService.usersDataBackend(userId);
        if (userData) {
          const userPicture = userData['picture'];
          this.channelUserPicture.push(userPicture);
        }
      }
    }
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
    if (this.channelId) {
      this.isInviteUserOpen = !this.isInviteUserOpen;
    }
  }

  closeInviteUserToChannel() {
    this.isInviteUserOpen = false;
  }

  openDirectMessageToUser(userId: any) {
    this.directMessageToUserService.setDirectMessageToUserId();
    this.chatBehavior.ChannelChatIsOpen = false;

    this.selectedUser = this.getUserById(userId);
    this.userDataResolver.sendDataUsers(this.selectedUser);
  }

  getUserById(userId: any) {
    return this.userData.find(user => user.id === userId) || null;
  }

  schrollToBottom() {
    if (this.dataIsLoading === true) {
      this.scrollService.scrollToBottom(this.chatContainer.nativeElement);
      this.dataIsLoading = false;
    }
  }
}
