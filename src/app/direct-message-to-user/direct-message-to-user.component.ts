import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Observable, Subscription } from "rxjs";
import { UserDataInterface, UserDataService } from "../service-moduls/user.service";
import { DirectMessageToUserInterface, DirectMessageToUserService } from "../service-moduls/direct-message-to-user.service";
import { map } from "rxjs/operators";
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel.service';
import { MessageDataInterface, MessageDataService } from '../service-moduls/message.service';
import { UserDataResolveService } from '../service-moduls/user-data-resolve.service';
import { DirectMessageToUserDataResolverService } from '../service-moduls/direct-messsage-to-user-data-resolver.service';
import { ScrollService } from '../service-moduls/scroll.service';
import { EmojiService } from '../service-moduls/emoji.service';

@Component({
  selector: 'app-direct-message-to-user',
  templateUrl: './direct-message-to-user.component.html',
  styleUrls: ['./direct-message-to-user.component.scss'],
})
export class DirectMessageToUserComponent implements OnInit, OnChanges {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  typedEmoji: string = '';
  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];
  emojisClickedBefore: number | undefined;
  directMessageToUserOpen: boolean = false;
  [x: string]: any;

  receivedUserData$!: Observable<UserDataInterface | null>

  userData: UserDataInterface[] = [];
  channelData: ChannelDataInterface[] = [];
  messageData: DirectMessageToUserInterface[] = [];

  mentionUser = new FormControl('');
  userList: string[] = [];

  selectedMessage: DirectMessageToUserInterface | null = null;
  selectedUserToChannel: UserDataInterface[] = [];
  searchResultsUsers: UserDataInterface[] = [];
  searchResultsChannels: ChannelDataInterface[] = [];
  availableChannels: ChannelDataInterface[] = [];
  isInvitationValid: boolean = false;

  directChat: string = '';
  updateDirectChatId: string = '';
  selectedUserNameOrChannelName: string = '';
  userIdInputSearch: string = '';

  messageInput: string[] = [];
  messageId: string = '';
  sentByName: string[] = [];
  usersFromUserData: string[] = [];
  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;
  currentUser: string = '';
  currentUserId: string = '';

  private chatTriggerSubscription!: Subscription;
  toggleSearchBar: boolean = true;
  inviteUserOrChannel!: string;

  userId: string = '';
  emojipickeractive = false;
  reactionListOpen = false;
  toggleUserList: boolean = true;
  toggleChannelList: boolean = true;
  dataIsLoading = false;

  triggerCRUDHTML: boolean = true;
  loading: boolean = false;

  searchResults: UserDataInterface[] = [];

  constructor(
    private directMessageToUserService: DirectMessageToUserService,
    public userDataService: UserDataService,
    public emojiService: EmojiService,
    public messageDataService: MessageDataService,
    public channelDataService: ChannelDataService,
    private chatBehavior: ChatBehaviorService,
    private userDataResolver: UserDataResolveService,
    private directMessageToUserDataResolverService: DirectMessageToUserDataResolverService,
    private scrollService: ScrollService,
  ) {
    this.chatTriggerSubscription = this.chatBehavior.crudTriggered$.subscribe(() => {
      this.toggleChat();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes here', this.sentByName);
  }

  ngOnInit(): void {
    this.getCurrentUserId();
    this.getUserData();
    this.compareIds();
    this.getDataFromChannel();

    setTimeout(() => {
      console.log('messageData', this.messageData);
    }, 1000);
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
        this.userList = userData.map((user) => user.name);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  async getDataFromChannel(): Promise<void> {
    this.receivedUserData$ = this.userDataResolver.resolve().pipe(
      map((userData: UserDataInterface | null) => {
        if (userData && userData.id) {
          this.processUserData(userData.id);
        }
        return userData;
      })
    );
    this.receivedUserData$.subscribe(
      (userData: UserDataInterface | null) => {
        console.log("User received from channel: ", userData);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
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
      console.log(user);
      this.isInvitationValid = true;
      this.userIdInputSearch = user.id;
      this.selectedUserNameOrChannelName = user.name;
      this.toggleUserList = false;
      this.inviteUserOrChannel = '';
      this.renderMessage(this.userIdInputSearch);
      console.log(this.userIdInputSearch);
    }
  }

  inviteChannel(channel: ChannelDataInterface):void {
    if (channel) {
      this.isInvitationValid = true;
      this.userIdInputSearch = channel.id;
      this.selectedUserNameOrChannelName = channel.channelName;
      this.toggleChannelList = false;
      this.inviteUserOrChannel = '';
      console.log(this.userIdInputSearch);
    }
  }

  toggleChat() {
    this.toggleSearchBar = !this.toggleSearchBar;
    this.inviteUserOrChannel = '';
    this.toggleUserList = false;
    this.toggleChannelList = false;
  }

  processUserData(userId: string) {
    this.userId = userId;
    this.renderMessage(this.userId);
    console.log('userId IST:::', this.userId);
  }

  renderMessage(userId: any) {
    if (userId) {
      const invitedUserId = this.userIdInputSearch;
      console.log("Get search input", invitedUserId);
      this.directMessageToUserService.getMessageData().subscribe(
        (messageData: DirectMessageToUserInterface[]) => {
          const messagesForUser = messageData.filter(message =>
            (message.user === this.userDataService.currentUser && message.userSentTo === userId) ||
            (message.user === userId && message.userSentTo === this.userDataService.currentUser)
          );
          if (invitedUserId) {
            const messagesForInvitedUser = messageData.filter(message =>
              (message.user === this.userDataService.currentUser && message.userSentTo === invitedUserId) ||
              (message.user === invitedUserId && message.userSentTo === this.userDataService.currentUser)
            );

            messagesForUser.push(...messagesForInvitedUser);
          }
          if (messagesForUser.length > 0) {
            const filteredData = messagesForUser.filter((message) => message.time !== undefined && message.time !== null);
            const sortDataAfterTime = filteredData.sort((a, b) => a.time! > b.time! ? 1 : -1);
            this.messageData = sortDataAfterTime;
            this.dataIsLoading = true;
          } else {
            this.messageData = [];
          }
        },
        (error) => {
          console.error('ERROR render messages in MessageToUser:', error);
        }
      );
    }
  }

  getCurrentUserId() {
    this.currentUserId = this.userDataService.currentUser;
    console.log('currentUserId ist::::', this.currentUserId);
  }

  public typeEmoji($event: any): void {
    this.messageInput = this.messageInput + $event.character;
  }

  isNewDay(
    currentMessage: DirectMessageToUserInterface,
    previousMessage: DirectMessageToUserInterface
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
      let indexWithCurrentUser = emojiArray.findIndex(
        (reaction: { [x: string]: string }) =>
          reaction['reaction-from'] === this.currentUser
      );
      emojiArray[indexWithCurrentUser] = {
        emoji: emoji,
        'reaction-from': this.currentUser,
      };
    } else {
      emojiArray.push({ emoji: emoji, 'reaction-from': this.currentUser });
    }
    this.directMessageToUserService.updateMessage(messageId, emojiArray);
    this.emojisClickedBefore = undefined;
    this.reactionListOpen = false;
  }

  existReaction(index: number): boolean {
    return this.messageData[index].emojis.some(
      (reaction: { [x: string]: string }) => {
        return reaction['reaction-from'] === this.currentUser;
      }
    );
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

  toggleEmojiPicker() {
    this.emojipickeractive = !this.emojipickeractive;
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
    currentDate.setHours(0, 0, 0, 0);

    const messageDate = new Date(time);
    messageDate.setHours(0, 0, 0, 0);

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
    this.directMessageToUserService.messageData$.subscribe(
      (messages: any[]) => {
        this.userDataService
          .getUserData()
          .pipe(map((userData) => userData.map((user) => user.id)))
          .subscribe((userIds: string[]) => {
            const userIdToNameMap: { [id: string]: string } = {};
            this.userData.forEach((user) => {
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
          });
      }
    );
  }

  async sendDirectMessageToUser(userId: string) {
    this.dataIsLoading = true;

    if (this.messageInput.length > 0 && this.messageInput[0].trim().length > 0) {
      console.log('messageInput', this.messageInput);
      const message: DirectMessageToUserInterface = {
        messageText: this.messageInput,
        sentById: this.currentUserId,
        time: Date.now(),
        emojis: [],
        mentionedUser: 'user_id_here',
        user: userId,
        userSentTo: this.userDataService.currentUser,
      };


      if (this.emojipickeractive) {
        this.toggleEmojiPicker();
      }

      console.log('user', this.userId),

        this.messageData.push(message);
      this.messageInput = [''];

      this.directMessageToUserService.sendMessage(message).subscribe(
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

  async deleteMessage(messageId: any) {
    if (!messageId) {
      return;
    }
    try {
      await this.directMessageToUserService.deleteMessage(messageId);
      this.messageData = this.messageData.filter((message) => message.id !== messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  schrollToBottom() {
    if (this.dataIsLoading === true) {
      this.scrollService.scrollToBottom(this.chatContainer.nativeElement);
      this.dataIsLoading = false;
    }
  }
}
