import { Component, ElementRef, OnInit } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { ChatService, MessageInterface } from '../service-moduls/chat.service';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';
import { Observable } from 'rxjs';
import { take, map, filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmojisComponent } from '../emojis/emojis.component';
import {
  UserDataService,
  UserDataInterface,
} from '../service-moduls/user-data.service';
import {
  ChannelDataService,
  ChannelDataInterface,
} from '../service-moduls/channel-data.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  typedEmoji: string = '';
  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];
  emojisClickedBefore: number | undefined;

  [x: string]: any;
  channelName!: FormGroup;
  channelDescription!: FormGroup;

  receivedChannelData$!: Observable<ChannelDataInterface | null>;
  userData: UserDataInterface[] = [];
  messageData: MessageInterface[] = [];

  currentChannelData: ChannelDataInterface | null = null;

  messageInput: string[] = [];
  messageId: string = '';
  sentByName: string[] = [];
  usersFromUserData: string[] = [];
  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;

  editChannelName: boolean = false;
  editChannelDescription: boolean = false;

  openEditChannel: boolean = false;
  emojipickeractive = false;

  constructor(
    private chatService: ChatService,
    private userDataService: UserDataService,
    private channelDataService: ChannelDataService,
    private firestore: Firestore,
    private ChannelDataResolver: ChannelDataResolverService,
    private fbChannelName: FormBuilder,
    private fbChannelDescription: FormBuilder,
    private elementRef: ElementRef
  ) {}

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
    this.compareIds();
  }

  public typeEmoji($event: any): void {
    this.messageInput = this.messageInput + $event.character;
  }

  async getUserData() {
    this.userDataService.getUserData().subscribe(
      (userData) => {
        this.userData = userData;
        console.log('Subscribed data users:', userData);
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
        sentBy: localStorage.getItem('currentUser') ?? '',
        time: Date.now(),
        emojis: [],
        thread: null,
        channel: 'your_channel_value_here', // Set the channel value to an appropriate value
        mentionedUser: 'user_id_here', // Set the mentioned user ID or leave it as null if not applicable
      };

      if (this.emojipickeractive) {
        this.toggleEmojiPicker(); // Assuming toggleEmojiPicker() is a method in this component to handle the emoji picker's visibility
      }

      // Add the new message locally to messageData
      this.messageData.push(message);

      // Update the message input to clear the textbox
      this.messageInput = [''];

      // Send the message to Firestore using the service
      this.chatService.sendMessage(message).subscribe(
        () => {
          // Message sent successfully (already updated in local messageData)
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

  reaction(messageEmoji: [], index: number) {
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

  //***********Zu Interface hinzufügen */
  reactWithEmoji(emoji: string) {}

  toggleEmojiPicker() {
    this.emojipickeractive = !this.emojipickeractive;
  }

  editChannel() {
    this.openEditChannel = true;
    this.receivedChannelData$.subscribe((data: ChannelDataInterface | null) => {
      if (data) {
        const channelId = data.id;
        const currentChannelData = channelId;
        this.currentChannelData = currentChannelData;
      }
      console.log('Received Channel Data:', this.currentChannelData);
    });
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
    }
  }

  saveChangesToChannelDescription() {}

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

  async compareIds() {
    this.chatService.messageData$.subscribe(
      (messages) => {
        // Extract all non-null sentBy values
        const allSentBy: string[] = messages
          .map((message) => message.sentBy)
          .filter((sentBy): sentBy is string => !!sentBy);

        console.log('All User IDs:', allSentBy);

        // Get the array of user IDs from userDataService
        this.userDataService.getUserData().pipe(
          map((userData) => userData.map(user => user.id))
        ).subscribe(
          (userIds: string[]) => {
            console.log('Subscribed data users ids:', userIds);

            // Compare arrays and find matches
            const matches: string[] = [];
            const sentByName: string[] = [];

            allSentBy.forEach((sentBy: string) => {
              if (userIds.includes(sentBy)) {
                matches.push(sentBy);

                // Find the user data with matching ID and get the name
                const user = this.userData.find(user => user.id === sentBy);
                if (user) {
                  sentByName.push(user.name);
                }
              }
            });

            console.log('Matching User IDs:', matches);
            console.log('Matching User Names:', sentByName);

            // Now you have the matching user names in the sentByName array
            // You can use this array as needed.
            this.sentByName = sentByName;
          }
        );
      }
    );
  }
}
