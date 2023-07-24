import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { ChatService, MessageInterface } from '../service-moduls/chat.service';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';
import { Observable } from 'rxjs';
import { ChannelDataInterface } from '../service-moduls/channel-data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmojisComponent } from '../emojis/emojis.component';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  typedEmoji: string = '';

  [x: string]: any;
  channelForm!: FormGroup;

  receivedChannelData$!: Observable<ChannelDataInterface | null>;
  userData: UserDataInterface[] = [];
  chatData: MessageInterface[] = [];
  messageInput: string[] = [];
  messageId: string = '';
  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;

  editChannelOpen: boolean = false;

  openEditChannel: boolean = false;
  emojipickeractive = false;

  constructor(
    private chatService: ChatService,
    private userDataService: UserDataService,
    private firestore: Firestore,
    private ChannelDataResolver: ChannelDataResolverService,
    private fbChannel: FormBuilder,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.channelForm = this.fbChannel.group({
      channelName: ['', [Validators.required]],
      channelDescription: ['', [Validators.required]],
    });
    this.getChatData();
    this.getDataFromChannel();
    this.getUserData();
  }

  public typeEmoji($event: any): void {
    console.log($event);
    this.messageInput = this.messageInput + $event.character;
  }

  async getUserData() {
    this.userDataService.getUserData().subscribe(
      userData => {
        this.userData = userData;
        console.log('Subscribed data users:', userData);
      },
      error => {
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
      (chatData) => {
        const filteredData = chatData.filter(
          (message) => message.time !== undefined && message.time !== null
        );
        this.chatData = filteredData.sort((a, b) =>
          a.time! > b.time! ? 1 : -1
        );
        console.log('Subscribed data users:', chatData);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  isNewDay(
    currentMessage: MessageInterface,
    previousMessage: MessageInterface
  ): boolean {
    if (!previousMessage) {
      return true; // If there is no previous message, it's a new day
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
      currentDate.getTime() === today.getTime() || // Check if currentDate is today
      currentDate.getTime() === yesterday.getTime() // Check if currentDate is yesterday
    );
  }

  async sendMessage() {
    if (this.messageInput.length > 0) {
      const message: MessageInterface = {
        messageText: this.messageInput, // Use the string, not an array
        time: Date.now(),
        emojis: [],
        thread: null,
        channel: 'your_channel_value_here', // Set the channel value to an appropriate value
        mentionedUser: 'user_id_here', // Set the mentioned user ID or leave it as null if not applicable
      };

      if (this.emojipickeractive) {
        this.toggleEmojiPicker(); // Assuming toggleEmojiPicker() is a method in this component to handle the emoji picker's visibility
      }

      // Add the new message locally to chatData
      this.chatData.push(message);

      // Update the message input to clear the textbox
      this.messageInput = [''];

      // Send the message to Firestore using the service
      this.chatService.sendMessage(message).subscribe(
        () => {
          // Message sent successfully (already updated in local chatData)
          console.log('Message sent');
        },
        (error) => {
          // Handle any errors if needed
          console.error('Error sending message:', error);
        }
      );
    } else {
      // Display a message or handle the situation when messageInput is empty
      console.log('Message input is empty. Cannot send an empty message.');
    }
  }

  toggleEmojiPicker() {
    this.emojipickeractive = !this.emojipickeractive;
  }

  editChannel() {
    this.openEditChannel = true;
  }

  openUserProfile() {
    this.isProfileCardOpen = true;
    this.isLogoutContainerOpen = false;
  }

  closeUserProfile() {
    this.isProfileCardOpen = false;
  }

  closeEditChannel() {
    this.openEditChannel = false;
  }

  updateChannels() {
    this.editChannelOpen = true;
  }

  saveChangesToChannel() {
    
  }

  leaveChannel() {}

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

    // For other dates, return the formatted date in 'mediumDate' format
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
}
