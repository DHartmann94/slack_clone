import { Component, OnInit } from '@angular/core';
import { MessageDataService, MessageDataInterface } from '../service-moduls/message.service';
import { UserDataService, UserDataInterface } from '../service-moduls/user.service';
import { ChatDataInterface, ChatDataService } from '../service-moduls/chat.service';
import { ThreadDataInterface, ThreadDataService } from '../service-moduls/thread.service';
import { DirectChatInterface, DirectChatService } from '../service-moduls/direct-chat.service';

@Component({
  selector: 'app-new-chat',
  templateUrl: './new-chat.component.html',
  styleUrls: ['./new-chat.component.scss']
})
export class NewChatComponent implements OnInit {
  userData: UserDataInterface[] = [];
  messageData: MessageDataInterface[] = [];
  chatData: ChatDataInterface[] = [];
  threadData: ThreadDataInterface[] = [];
  directChatData: DirectChatInterface[] = [];

  channelId: string = "";
  inviteUserOrChannel!: string;
  searchResults: UserDataInterface[] = [];
  toggleUserList: boolean = true;


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
    private messageDataService: MessageDataService,
    public userDataService: UserDataService,
    private chatDataService: ChatDataService,
    private threadDataService: ThreadDataService,
    private directChatService: DirectChatService,
  ) {}

  ngOnInit(): void {
   
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
        this.toggleEmojiPicker();
      }

      this.messageData.push(message);
      this.messageInput = [''];

      this.messageDataService.sendMessage(message).subscribe(
        (newMessage) => {
          if (newMessage && newMessage.id) {
            this.chatDataService.addMessageToChat(newMessage).subscribe();
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
      this.messageDataService.deleteMessage(messageId);
      this.messageData = this.messageData.filter(message => message.id !== messageId);
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


  reactWithEmoji(emoji: string, index: number, messageId: string) {
    let emojiArray = this.messageData[index].emojis;

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

    this.messageDataService.updateMessage(messageId, emojiArray);
    this.emojisClickedBefore = undefined;
    this.reactionListOpen = false;
  }

  public typeEmoji($event: any): void {
    this.messageInput = this.messageInput + $event.character;
  }

  existEmoji(index: number, typedEmoji: string) {
    return this.messageData[index].emojis.some((emoji: { [x: string]: string; }) => {
      return emoji['emoji'] === typedEmoji;
    });
  }

  openThread(threadId: string) {
    // Eine globale variable mit einer ID befüllen. (Um zu verhindern das eine neue Thread Id beim senden der message entsteht!)
    // Zweites Textfeld holt sich die globale Variable.

    /*this.threadDataService.openThread(messageId);*/
  }
}
 
