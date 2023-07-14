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

  constructor(private chatService: ChatService, private firestore: Firestore,) { }

  ngOnInit(): void {
    this.getChatData();
  }

  async getChatData() {
    this.chatService.getMessage().subscribe(
      (chatData) => {
        this.chatData = chatData;
        console.log('Subscribed data users:', chatData);
      },
      (error) => {
        console.error('Error retrieving user data:', error);
      }
    );
  }

  async sendMessage() {
    if (this.messageInput !== null) {
      const message: MessageInterface = {
        id: this.messageId,
        text: this.messageInput,
        time: Date.now(),
        emojis: [],
        thread: null,
      };

      const chatlCollection = collection(this.firestore, 'chat');
      const docRef = await addDoc(chatlCollection, message);
      this.messageId = docRef.id;


      console.log('Message ID', this.messageId);
      console.log('Sent message', this.messageInput);
    }
  }
}
