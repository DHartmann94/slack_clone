import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Observable, Subscription } from "rxjs";
import { UserDataInterface, UserDataService } from "../service-moduls/user.service";
import { DirectMessageToUserInterface, DirectMessageToUserService } from "../service-moduls/direct-message-to-user.service";
import { map } from "rxjs/operators";
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { FormControl } from "@angular/forms";
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel.service';
import { MessageDataService } from '../service-moduls/message.service';
import { UserDataResolveService } from '../service-moduls/user-data-resolve.service';
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
  inputSearchId: any;

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
  closeSearchContainer: boolean = false;
  inputSearchIdResults: string = '';
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

    /*setTimeout(() => {
      console.log('messageData', this.messageData);
    }, 1000);*/
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
      if (this.inputSearchId) {
        this.inputSearchIdResults = user.name;
        this.renderMessage(this.inputSearchId);
        this.sendDirectMessageToUser(this.inputSearchId);
      }
      this.selectedUserNameOrChannelName = user.name;
      this.toggleUserList = false;
      this.closeSearchContainer = false;
      this.inviteUserOrChannel = '';
    }
  }

 /*  inviteChannel(channel: ChannelDataInterface):void {
    if (channel) {
      this.isInvitationValid = true;
      this.inputSearchId = channel.id;
      this.selectedUserNameOrChannelName = channel.channelName;
      this.toggleChannelList = false;
      this.closeSearchContainer = false;
      this.inviteUserOrChannel = '';
    }
  } */

  toggleChat() {
    this.toggleSearchBar = !this.toggleSearchBar;
    this.inviteUserOrChannel = '';
    this.toggleUserList = false;
    this.toggleChannelList = false;
    this.closeSearchContainer = false;
  }

  processUserData(userId: string) {
    this.userId = userId;
    this.renderMessage(this.userId);
  }

  renderMessage(userId: any) {
    if (userId) {
      const invitedUserId = this.inputSearchId;
      this.directMessageToUserService.getMessageData().subscribe(
        (messageData: DirectMessageToUserInterface[]) => {
          const messagesForUser = messageData.filter(message =>
            (message.user === this.userDataService.currentUser && message.userSentTo === userId) ||
            (message.user === userId && message.userSentTo === this.userDataService.currentUser)
          );
          if (invitedUserId) {
            const messagesForInvitedUser = messageData.filter(message =>
              (message.user && message.invitedUserId === invitedUserId) ||
              (message.user === invitedUserId && message.invitedUserId)
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
  }

  public typeEmoji($event: any): void {
    this.messageInput = this.messageInput + $event.character;
  }

  isNewDay(currentMessage: DirectMessageToUserInterface, previousMessage: DirectMessageToUserInterface): boolean {
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

  reaction(messageEmoji:string, index:number) {
    if (this.emojisClickedBefore === index) {
      this.hideEmojis(this.emojisClickedBefore);
      this.emojisClickedBefore = undefined;
    } else {
      if (this.emojisClickedBefore !== null) {
       this.hideEmojis(this.emojisClickedBefore);
      }
      this.showEmojis(index);
      this.emojisClickedBefore = index;
    }
  }

  showEmojis(emojiIndex:number) {
    let button = document.getElementById(`reaction-button${emojiIndex}`)
    const emojiElement = document.getElementById(`reaction${emojiIndex}`);
    if (emojiElement) {
      emojiElement.classList.add('showEmojis');
    }
    this.emojiService.behindReactionContainer = true;
    button?.classList.add('d-none');
  }

  
  hideEmojis(emojiIndex:any) {
    let button = document.getElementById(`reaction-button${emojiIndex}`)
    const emojiElement = document.getElementById(`reaction${emojiIndex}`);
    
    if (emojiElement) {
      emojiElement.classList.remove('showEmojis');
    }
    this.emojisClickedBefore = undefined;
    this.emojiService.behindReactionContainer = false;
    button?.classList.remove('d-none');
  }

  reactWithEmoji(emoji: string, index: number, messageId: string, message: DirectMessageToUserInterface) {
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
    this.hideEmojis(index);
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
    this.hideAllReactionLists();
    if (!this.reactionListOpen) {
      item?.classList.add('show-list-of-reactions');
      this.reactionListOpen = true;
      this.emojiService.behindShowReactionContainer = true;
    } else {
      this.reactionListOpen = false;
    }
  }

  hideAllReactionLists() {
    this.messageData.forEach((message, i) => {
      let hideItems = document.getElementById(`reactionlist${i}`);
      hideItems?.classList.remove('show-list-of-reactions');
    });
    this.emojiService.behindShowReactionContainer = false;
    this.reactionListOpen = false;
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

  async sendDirectMessageToUser(inputSearchId: any) {
    this.dataIsLoading = true;
    if (this.messageInput.length > 0 && this.messageInput[0].trim().length > 0) {
      const message: DirectMessageToUserInterface = {
        messageText: this.messageInput,
        sentById: this.currentUserId,
        time: Date.now(),
        emojis: [],
        mentionedUser: 'user_id_here',
        user: this.userId,
        userSentTo: this.userDataService.currentUser,
        invitedUserId: inputSearchId,
      };

      if (this.emojipickeractive) {
        this.toggleEmojiPicker();
      }

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
