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


  // reactWithEmoji(emoji: string, index: number, messageId: string, message: MessageDataInterface) {
  //   let emojiArray = message.emojis;
  //   debugger
  //   emojiArray.forEach((emoj: { [x: string]: any[]; }) => {
  //     if (emoj['reaction-from'].includes(this.userDataService.userName)) {
  //       const userIndex = emoj['reaction-from'].indexOf(this.userDataService.userName);
  //       emoj['reaction-from'].splice(userIndex, 1);
  //     }
  //   });

  //   if (this.existEmoji(index, emoji, this.messageData)) {

  //     let indexWithTypedEmoji = emojiArray.findIndex((em: { [x: string]: string; }) => em['emoji'] === emoji);
  //     emojiArray[indexWithTypedEmoji]['reaction-from'].push(this.userDataService.userName);
  //   } else {
  //     emojiArray.push({ 'emoji': emoji, 'reaction-from': [this.userDataService.userName] });
  //   }

  //   let indexWithEmojiToDelete = emojiArray.findIndex((em: { [x: string]: string; }) => em['reaction-from'].length == 0);
  //   if (indexWithEmojiToDelete != -1) {
  //     emojiArray.splice(indexWithEmojiToDelete, 1);
  //   }

  //   console.log('my Emoji Array', emojiArray);

  //   this.messageDataService.updateMessage(messageId, emojiArray);
  //   this.emojisClickedBefore = undefined;
  //   this.reactionListOpen = false;
  // }


  existEmoji(index: number, typedEmoji: string, messageData: MessageDataInterface[]) {
    debugger
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
