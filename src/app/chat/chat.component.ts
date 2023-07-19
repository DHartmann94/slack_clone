import { Component, OnInit } from '@angular/core';
import { addDoc, collection, doc, Firestore } from '@angular/fire/firestore';
import { ChatService, MessageInterface } from '../service-moduls/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  chatData: MessageInterface[] = [];
  messageInput: string[] = [];
  messageId: string = '';
  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;

  constructor(private chatService: ChatService, private firestore: Firestore) {}

  ngOnInit(): void {
    this.getChatData();
  }

  async getChatData() {
    this.chatService.getMessage().subscribe(
      (chatData) => {
        const filteredData = chatData.filter(
          (message) => message.time !== undefined && message.time !== null
        );
        this.chatData = filteredData.sort((a, b) => a.time! - b.time!);
        console.log('Subscribed data users:', chatData);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  async sendMessage() {
    if (this.messageInput) {
      const message: MessageInterface = {
        messageText: this.messageInput,
        time: Date.now(),
        emojis: [],
        thread: null,
      };

      const chatCollection = collection(this.firestore, 'messages');
      const docRef = await addDoc(chatCollection, message);
      this.messageId = docRef.id;
      console.log('Message ID', this.messageId);
      console.log('Sent message', this.messageInput);
      this.messageInput = [''];
    }
  }

  openUserProfile() {
    this.isProfileCardOpen = true;
    this.isLogoutContainerOpen = false;
  }

  closeUserProfile() {
    this.isProfileCardOpen = false;
  }

  formatTimeStamp(time: number | undefined): string {
    // Check if time is undefined, and return 'N/A' in that case.
    if (typeof time === 'undefined') {
      return 'N/A';
    }

    // Erstellen Sie ein Date-Objekt mit der übergebenen Zeit
    const dateObj = new Date(time);

    // Extrahieren Sie Stunden und Minuten aus dem Date-Objekt
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    // Stellen Sie sicher, dass Stunden und Minuten immer zweistellig sind
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // Bestimmen Sie, ob es sich um "am" oder "pm" handelt
    const amOrPm = hours >= 12 ? 'pm' : 'am';

    // Erstellen Sie das gewünschte Zeitformat
    return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
  }
}
