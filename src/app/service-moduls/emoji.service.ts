import { Injectable } from '@angular/core';
import { UserDataService } from './user.service';
import { MessageDataInterface, MessageDataService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  messageData: any;
  emojisClickedBefore: number | undefined;
  reactionListOpen: any;
  emojipickeractive: boolean | undefined;


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


  // TODO: --> Checken ob es funktioniert wenn verschiedene Nutzer reagieren. 
  reactWithEmoji(emoji: string, index: number, messageId: string) {
    let emojiArray = this.messageData[index].emojis;

    //Wenn der CU bereits reagiert hat... funktioniert
    emojiArray.forEach((emoj: { [x: string]: any[]; }) => {
      if (emoj['reaction-from'].includes(this.userDataService.userName)) {
        const userIndex = emoj['reaction-from'].indexOf(this.userDataService.userName);
        emoj['reaction-from'].splice(userIndex, 1);
      }
    });

    //Wenn das Emoji bereits in dieser Nachricht existiert, dann wird nur in "reaction.." gepusht.
    // Falls nicht, dann wird das Emoji mit dem CU gepusht. (funktioniert!)
    if (this.existEmoji(index, emoji)) {

      let indexWithTypedEmoji = emojiArray.findIndex((em: { [x: string]: string; }) => em['emoji'] === emoji);
      emojiArray[indexWithTypedEmoji]['reaction-from'].push(this.userDataService.userName);
    } else {
      emojiArray.push({ 'emoji': emoji, 'reaction-from': [this.userDataService.userName] });
    }

    // Wenn bei einem Emoji die ['reactions-from].length 0 ist, dann wird das Emoji aus dem Array gelöscht
    //funktioniert!
    let indexWithEmojiToDelete = emojiArray.findIndex((em: { [x: string]: string; }) => em['reaction-from'].length == 0);
    if (indexWithEmojiToDelete != -1) {
      emojiArray.splice(indexWithEmojiToDelete, 1);
    }

    console.log('my Emoji Array', emojiArray);

    this.messageDataService.updateMessage(messageId, emojiArray);
    this.emojisClickedBefore = undefined;
    this.reactionListOpen = false;
  }


  existEmoji(index: number, typedEmoji: string) {
    return this.messageData[index].emojis.some((emoji: { [x: string]: string; }) => {
      return emoji['emoji'] === typedEmoji;
    });
  }


  existReaction(index: number): boolean {
    return this.messageData[index].emojis.some((reaction: { [key: string]: string }) => {
      return reaction['reaction-from'].includes(this.userDataService.chatUserName);
    });
  }


  showReaction(index: number) {
    let item = document.getElementById(`reactionlist${index}`);
    this.messageData.forEach((message: any, i: any) => {
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

}
