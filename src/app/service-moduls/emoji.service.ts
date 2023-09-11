import { Injectable } from '@angular/core';
import { UserDataService } from './user.service';
import { MessageDataInterface, MessageDataService } from './message.service';
import { ThreadDataInterface } from './thread.service';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  messageData: any;
  emojisClickedBefore: number | undefined;
  reactionListOpen: any;
  emojipickeractiveChat: boolean | undefined;
  emojipickeractiveThread: boolean | undefined;
  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];


  constructor(
    public userDataService: UserDataService,
    public messageDataService: MessageDataService,
    
    ) { }



   // *** EMOJI REACTION ***
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


  existEmoji(index: number, typedEmoji: string, messageData: MessageDataInterface[]) {
    return messageData[index].emojis.some((emoji: { [x: string]: string; }) => {
      return emoji['emoji'] === typedEmoji;
    });
  }
  
  existEmojiThread(index: number, typedEmoji: string, messageData: MessageDataInterface[]) {
    return messageData[index].emojis.some((emoji: { [x: string]: string; }) => {
      return emoji['emoji'] === typedEmoji;
    });
  }


  toggleEmojiPicker(component: string) {
    if (component === 'chat') {
      this.emojipickeractiveChat = !this.emojipickeractiveChat;
    } else if (component === 'thread') {
      this.emojipickeractiveThread = !this.emojipickeractiveThread;
    }
    
  }

}
