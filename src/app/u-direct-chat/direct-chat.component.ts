import { Component, OnInit } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user.service';
import { ThreadDirectService, ThreadDirectDataInterface } from '../service-moduls/thread-direct.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { DirectMessageInterface, DirectMessageService } from '../service-moduls/direct-message.service';
import { ChannelDataService, ChannelDataInterface } from '../service-moduls/channel.service';
import { Observable, Subject, Subscription, map } from 'rxjs';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';

@Component({
  selector: 'app-new-chat',
  templateUrl: './direct-chat.component.html',
  styleUrls: ['./direct-chat.component.scss']
})

export class DirectChatComponent implements OnInit {
  userData: UserDataInterface[] = [];
  threadData: ThreadDirectDataInterface[] = [];
  directMessageData: DirectMessageInterface[] = [];
  channelData: ChannelDataInterface[] = [];

  inviteUserOrChannel: string = '';
  userIds: string = '';
  directChatId: string = "";
  isInvitationValid: boolean = false;
  closeDirectChatWindow: boolean = false;
 
  searchResultsUsers: UserDataInterface[] = [];
  searchResultsChannels: ChannelDataInterface[] = [];
  availableChannels: ChannelDataInterface[] = [];
  toggleUserList: boolean = true;
  toggleChannelList: boolean = true;

  selectedMessage: DirectMessageInterface | null = null;
  receivedDirectChatData$!: Observable<DirectMessageInterface | null>;

  messageInput: string[] = [];
  messageId: string = '';
  sentByName: string[] = [];
  usersFromUserData: string[] = [];
  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;
  currentUser: string = '';
  currentUserId: string = '';
  selectedUserNameOrChannelName: string = ''; 

  emojipickeractive = false;
  reactionListOpen = false;
  typedEmoji: string = '';
  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];
  emojisClickedBefore: number | undefined;

  constructor(
    public userDataService: UserDataService,
    private threadDirectDataService: ThreadDirectService,
    private directMessageService: DirectMessageService,
    private channelDataService: ChannelDataService,
    private chatBehavior: ChatBehaviorService,
  ) { }

  ngOnInit(): void {
    this.getDirectChatData();
    this.compareIds();
    this.getCurrentUserId();
    this.getThreadData();
    /* this.getDataFromDirectChat(); */
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

 /*  async getDataFromDirectChat(): Promise<void> {
    this.receivedDirectChatData$ = this.directChatDataResolver.resolve().pipe(
      map((data: DirectMessageInterface | null) => {
        console.log("Direct chat data received", data);
       if (data && data.id) {
          this.processDirectChatData(data.id);
        }
        return data;
      })
    )
    this.receivedDirectChatData$ = this.directChatDataResolver.resolve();
    this.receivedDirectChatData$ .subscribe(
      (data: DirectMessageInterface | null) => {
        console.log("User received from channel: ", data);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  } */

  async getThreadData() {
    this.threadDirectDataService.getThreadDataDirectMessages().subscribe(
      (threadData: ThreadDirectDataInterface[]) => {
        this.threadData = threadData;
        console.log("Get thread data", threadData);
      },
      (error) => {
        console.error('Error fetching thread data:', error);
      }
    );
  }

  triggerChat() {
    this.chatBehavior.triggerChat();
  }

  processDirectChatData(channelId: string) {
    this.directChatId = channelId;
    this.renderDirectChatById(this.directChatId);
  }

  selectMessage(messageId: any) {
    this.selectedMessage = this.getMessageId(messageId);
    console.log(this.selectedMessage);
  }

  getMessageId(messageId: any) {
    return this.directMessageData.find(message => message.id === messageId) || null;
  }

  renderDirectChatById(directChat: string) {
    if (directChat) {
      this.directMessageService.getDirectMessageData().subscribe(
        (directMessageData: DirectMessageInterface[]) => {
          const messagesnewChat = directMessageData.filter(directmessage => directmessage.users === directMessageData);
          if (messagesnewChat.length > 0) {
            const filteredData = messagesnewChat.filter((message) => message.time !== undefined && message.time !== null);
            const sortDataAfterTime = filteredData.sort((a, b) => a.time! > b.time! ? 1 : -1);
            console.log('Messages to Render:', sortDataAfterTime);
            this.directMessageData = sortDataAfterTime;
          } else {
            console.log('No messages found:', directChat); 
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
      const threadId = this.threadDirectDataService.generateThreadId();
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
    this.threadDirectDataService.setThreadId(threadId);
  }
}
 
