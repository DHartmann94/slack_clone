import { Component, OnInit } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user.service';
import { ThreadDataInterface, ThreadDataService } from '../service-moduls/thread.service';
import { DirectMessageInterface, DirectMessageService } from '../service-moduls/direct-message.service';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel.service';
import { Observable, Subject, Subscription, map } from 'rxjs';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';

@Component({
  selector: 'app-new-chat',
  templateUrl: './direct-chat.component.html',
  styleUrls: ['./direct-chat.component.scss']
})

export class NewChatComponent implements OnInit {
  userData: UserDataInterface[] = [];
  threadData: ThreadDataInterface[] = [];
  directMessageData: DirectMessageInterface[] = [];
  channelData: ChannelDataInterface[] = [];

  inviteUserOrChannel: string = '';
  userIds: string = '';
  channelId: string = "";
  isInvitationValid: boolean = false;
 
  searchResultsUsers: UserDataInterface[] = [];
  searchResultsChannels: ChannelDataInterface[] = [];
  toggleUserList: boolean = true;
  toggleChannelList: boolean = true;

  selectedMessage: DirectMessageInterface | null = null;
  receivedChannelData$!: Observable<ChannelDataInterface | null>;

  messageInput: string[] = [];
  messageId: string = '';
  sentByName: string[] = [];
  usersFromUserData: string[] = [];
  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;
  currentUser: string = '';
  currentUserId: string = '';

  emojipickeractive = false;
  reactionListOpen = false;
  typedEmoji: string = '';
  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];
  emojisClickedBefore: number | undefined;

  constructor(
    public userDataService: UserDataService,
    private threadDataService: ThreadDataService,
    private directMessageService: DirectMessageService,
    private channelDataResolver: ChannelDataResolverService,
    private channelDataService: ChannelDataService,
  ) {}

  ngOnInit(): void {
    this.getDirectChatData();
    this.getChannelData();
    this.compareIds();
    this.getCurrentUserId();
    this.getThreadData();
  }

  async getDirectChatData() {
    this.directMessageService.getDirectMessageData().subscribe(
      (directMessageData: DirectMessageInterface[]) => {
        this.directMessageData = directMessageData;
        console.log("Get direct chat data", directMessageData);
      },
      (error) => {
        console.error('Error fetching direct chat data:', error);
      }
    );
  }

  async getChannelData() {
    this.channelDataService.getChannelData().subscribe(
      channelData => {
        this.channelData = channelData;
        console.log('Subscribed data channels:', channelData);
      },
      error => {
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
    this.threadDataService.getThreadDataDirectMessages().subscribe(
      (threadData: ThreadDataInterface[]) => {
        this.threadData = threadData;
        console.log("Get thread data", threadData);
      },
      (error) => {
        console.error('Error fetching thread data:', error);
      }
    );
  }

  processChannelData(channelId: string) {
    this.channelId = channelId;
    this.renderChatById(this.channelId);
  }

  filterUsers(): void {
    if (this.inviteUserOrChannel) {
      const searchBy = this.inviteUserOrChannel.toLowerCase();
      if (searchBy.startsWith('@')) {
        const userName = searchBy.substr(1);
        this.searchResultsUsers = this.userDataService.userData.filter(user =>
          user.name.toLowerCase().includes(userName)
        );
      } else if (this.inviteUserOrChannel && this.inviteUserOrChannel.startsWith('#')) {
        const channelName = this.inviteUserOrChannel.substr(1).toLowerCase();
        this.searchResultsChannels = this.channelData;
        const matchedChannels = this.channelDataService.channelData.filter(channel =>
          channel.channelName.toLowerCase().includes(channelName)
        );
        matchedChannels.flatMap(channel =>
          channel.users.map((userId: string) =>
          this.userDataService.userData.find(user => user.id === userId)
        ));
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
      this.userIds = user.id;
      console.log(this.userIds);
    }
  }

  inviteChannel(channel: ChannelDataInterface):void {
    if (channel) {
      this.isInvitationValid = true;
      this.userIds = channel.id;
      console.log(this.userIds);
    }
  }

  selectMessage(messageId: any) {
    this.selectedMessage = this.getMessageId(messageId);
    console.log(this.selectedMessage);
  }

  getMessageId(messageId: any) {
    return this.directMessageData.find(message => message.id === messageId) || null;
  }

  renderChatById(channel: string) {
    if (channel) {
      this.directMessageService.getDirectMessageData().subscribe(
        (messageData: DirectMessageInterface[]) => {
          const messagesnewChat = messageData.filter(message => message.channel === channel);
          if (messagesnewChat.length > 0) {
            const filteredData = messagesnewChat.filter((message) => message.time !== undefined && message.time !== null);
            const sortDataAfterTime = filteredData.sort((a, b) => a.time! > b.time! ? 1 : -1);
            console.log('Messages to Render:', sortDataAfterTime);
            this.directMessageData = sortDataAfterTime;
          } else {
            console.log('No messages found:', channel); 
            this.directMessageData = [];
          }
        },
        (error) => {
          console.error('ERROR render messages in channel:', error);
        }
      );
    } else {
      this.directMessageData = [];
    }
  }

  getCurrentUserId() {
    this.currentUserId = this.userDataService.currentUser;
  }

  async compareIds() {
    this.directMessageService.directMessageData$.subscribe(
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

  isNewDay(currentMessage: DirectMessageInterface, previousMessage: DirectMessageInterface): boolean {
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

  openUserProfile(id: any) {
    this.isProfileCardOpen = true;
    this.isLogoutContainerOpen = false;
    this.userDataService.getCurrentUserData(id);
  }

  async sendMessage() {
    if (this.isInvitationValid && this.messageInput.length > 0) {
      const threadId = this.threadDataService.generateThreadId();
      const message: DirectMessageInterface = {
        messageText: this.messageInput,
        sentById: this.currentUserId,
        time: Date.now(),
        emojis: [],
        thread: threadId,
        directMessageTo: this.userIds,
      };

      if (this.emojipickeractive) {
        this.toggleEmojiPicker();
      }

      this.directMessageData.push(message);
      this.messageInput = [''];

      this.directMessageService.sendDirectMessage(message).subscribe(
        (newMessage) => {
          if (newMessage && newMessage.id) {
            const index = this.directMessageData.findIndex((msg) => msg === message);
            if (index !== -1) {
              this.directMessageData[index].id = newMessage.id;
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
      this.directMessageService.deleteDirectMessage(messageId);
      this.directMessageData = this.directMessageData.filter(message => message.id !== messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
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

  showReaction(index: number) {
    let item = document.getElementById(`reactionlist${index}`);
    this.directMessageData.forEach((i) => {
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

  reactWithEmoji(emoji: string, index: number, messageId: string) {
    let emojiArray = this.directMessageData[index].emojis;

    emojiArray.forEach((emoj: { [x: string]: any[]; }) => {
      if (emoj['reaction-from'].includes(this.userDataService.userName)) {
        const userIndex = emoj['reaction-from'].indexOf(this.userDataService.userName);
        emoj['reaction-from'].splice(userIndex, 1);
      }
    });

    if (this.existEmoji(index, emoji)) {
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

    this.directMessageService.updateDirectMessage(messageId, emojiArray);
    this.emojisClickedBefore = undefined;
    this.reactionListOpen = false;
  }

  public typeEmoji($event: any): void {
    this.messageInput = this.messageInput + $event.character;
  }

  existEmoji(index: number, typedEmoji: string) {
    return this.directMessageData[index].emojis.some((emoji: { [x: string]: string; }) => {
      return emoji['emoji'] === typedEmoji;
    });
  }

  openThread(threadId: string) {
    this.threadDataService.setThreadId(threadId);
  }
}
 
