import { Injectable } from '@angular/core';
import { UserDataService } from './user.service';
import { MessageDataInterface, MessageDataService } from './message.service';
import { ScrollService } from './scroll.service';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  behindReactionContainer = false;
  behindShowReactionContainer = false;

  messageData: any;
  emojisClickedBefore: number | undefined;
  reactionListOpen: any;
  emojipickeractiveChat: boolean | undefined;
  emojipickeractiveThread: boolean | undefined;
  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];


  constructor(
    public userDataService: UserDataService,
    public messageDataService: MessageDataService,
    public scrollService: ScrollService
    ) { }


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
