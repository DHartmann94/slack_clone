
import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Observable, Subscription } from "rxjs";
import { ChannelDataInterface, ChannelDataService } from "../service-moduls/channel.service";
import { UserDataInterface, UserDataService } from "../service-moduls/user.service";
import { MessageDataInterface, MessageDataService } from "../service-moduls/message.service";
import { map } from "rxjs/operators";
import { ChannelDataResolverService } from "../service-moduls/channel-data-resolver.service";
import { ChatBehaviorService } from "../service-moduls/chat-behavior.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ThreadDataInterface, ThreadDataService } from "../service-moduls/thread.service";
import { collection, doc, Firestore, getDoc, updateDoc } from "@angular/fire/firestore";
import { EmojiService } from '../service-moduls/emoji.service';
import { MentionService } from '../service-moduls/mention.service';
import { ScrollService } from '../service-moduls/scroll.service';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent implements OnInit, OnChanges {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  private threadUpdateSubscription: Subscription = new Subscription();

  typedEmoji: string = '';
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

  userProfile: UserDataInterface[] = [];

  mentionUser = new FormControl('');
  userList: string[] = [];

  selectedMessage: MessageDataInterface | null = null;
  currentChannelData: ChannelDataInterface | null = null;

  channelId: string = "";
  updateChatById: string = "";

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

  triggerCRUDHTML: boolean = true;
  loading: boolean = false;

  inviteUserOrChannel!: string;
  searchResults: UserDataInterface[] = [];


  constructor(
    private messageDataService: MessageDataService,
    public userDataService: UserDataService,
    public emojiService: EmojiService,
    public mentionService: MentionService,
    private channelDataService: ChannelDataService,
    private channelDataResolver: ChannelDataResolverService,
    private chatBehavior: ChatBehaviorService,
    private fbChannelName: FormBuilder,
    private fbChannelDescription: FormBuilder,
    private threadDataService: ThreadDataService,
    private firestore: Firestore,
    private scrollService: ScrollService,
  ) { }

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
    this.getCurrentUserId();
    this.startThread();

  }

  async startThread() {
    this.threadUpdateSubscription = this.threadDataService.threadUpdate$.subscribe(async () => {
      await this.renderChatByThreadId();
      //await this.getChannelData();
    });
  }

  ngAfterViewChecked(): void {
    this.scrollService.scrollToBottom(this.chatContainer.nativeElement);
  }

  ngOnDestroy() {
    /* this.crudTriggeredSubscription.unsubscribe(); */
    this.threadUpdateSubscription.unsubscribe();
  }

  async renderChatByThreadId() {
    if (this.threadDataService.threadId) {
      this.threadDataService.getThreadDataMessages().subscribe(
        (threadData: ThreadDataInterface[]) => {
          const messagesForChannel = threadData.filter(message => message.thread === this.threadDataService.threadId);
          if (messagesForChannel.length > 0) {
            const filteredData = messagesForChannel.filter((message) => message.time !== undefined && message.time !== null);
            const sortDataAfterTime = filteredData.sort((a, b) => a.time! > b.time! ? 1 : -1);
            console.log('Messages to Render in Thread:', sortDataAfterTime);
            this.threadData = sortDataAfterTime;

            this.getChannelData();
          } else {
            console.log('No messages found in Thread:', this.threadDataService.threadId);
            this.threadData = [];
          }
        },
        (error) => {
          console.error('ERROR render messages in Thread:', error);
        }
      );
    } else {
      this.threadData = [];
    }
  }

  async getChannelData() {
    console.log(this.threadData[0].channel);
    this.processChannelData(this.threadData[0].channel);
  }

  processChannelData(channelId: string) {
    this.channelId = channelId;
    this.updateChatById = channelId;
    this.renderChatByChannelId(this.updateChatById);
  }

  renderChatByChannelId(channel: string) {
    if (channel) {
      console.log(channel);
      this.channelDataService.getChannelData().subscribe(
        (channelData: ChannelDataInterface[]) => {
          const filterChannel = channelData.filter((channelItem) => channelItem.id === channel);
          this.channelData = filterChannel;
          this.loading = true;
          console.log("The filterd channel id in THREAD", this.channelData);
        },
        (error) => {
          console.error('Error THREAD chat data:', error);
        }
      );
    } else {
      this.channelData = [];
    }
  }

  getCurrentUserId() {
    this.currentUserId = this.userDataService.currentUser;
  }

  public typeEmoji($event: any): void {
    this.messageInput = this.messageInput + $event.character;
  }

  addMention(name: string) {
    let mention = ` @${name} `;
    this.messageInput = [this.messageInput + mention];
  }

  isNewDay( currentMessage: MessageDataInterface, previousMessage: MessageDataInterface): boolean {
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
      const message: MessageDataInterface = {
        messageText: this.messageInput,
        sentById: this.currentUserId,
        time: Date.now(),
        emojis: [],
        thread: this.threadDataService.threadId,
        channel: 'Thread Message',
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

  reaction(messageEmoji: string, index: number) {
    if (this.emojisClickedBefore === index) {
      document
        .getElementById(`reaction-in-thread${this.emojisClickedBefore}`)
        ?.classList.remove('showEmojis');
      this.emojisClickedBefore = undefined;
    } else {
      if (this.emojisClickedBefore !== null) {
        document
          .getElementById(`reaction-in-thread${this.emojisClickedBefore}`)
          ?.classList.remove('showEmojis');
      }
      document.getElementById(`reaction-in-thread${index}`)?.classList.add('showEmojis');
      this.emojisClickedBefore = index;
    }
  }

  reactWithEmoji(emoji: string, index: number, messageId: string, message:MessageDataInterface) {
    let emojiArray = message.emojis;
    
    emojiArray.forEach((emoj: { [x: string]: any[]; }) => {
      if (emoj['reaction-from'].includes(this.userDataService.userName)) {
        const userIndex = emoj['reaction-from'].indexOf(this.userDataService.userName);
        emoj['reaction-from'].splice(userIndex, 1);
      }
    });

    if (this.emojiService.existEmoji(index, emoji, this.threadData)) {
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

  toggleEmojiPicker() {
    this.emojipickeractive = !this.emojipickeractive;
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
      await this.messageDataService.deleteMessage(messageId);
      this.messageData = this.messageData.filter(message => message.id !== messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  close() {
    this.loading = false;
    this.threadDataService.threadOpen = false;
  }
}

