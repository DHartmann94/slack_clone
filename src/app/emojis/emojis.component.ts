import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-emojis',
  templateUrl: './emojis.component.html',
  styleUrls: ['./emojis.component.scss']
})

export class EmojisComponent implements OnInit{

  constructor(public chat: ChatComponent) {}

  @Output() newEmoji = new EventEmitter<string>();

  public typedEmoji: string ='';

  searchValue: string = '';
  myEmojis: any;
  emojiSelectorIcon = document.getElementById('emojiSelectorIcon');
  emojiSelector = document.getElementById('emojiSelector');
  emojiList:Array<any> = [];
  allEmojis:Array<any> = [];
  filteredEmojiList = [];

  url = 'https://emoji-api.com/emojis?access_key=60ede231f07183acd1dbb4bdd7dde0797f62e95e'

  

  ngOnInit(): void {
    this.getEmojis();
  }


  getEmojis() {
    fetch(this.url)
      .then(res => res.json())
      .then(data => this.loadEmoji(data));
  }


  loadEmoji(data:[]) {
    data.forEach(emoji => {
      this.emojiList.push(emoji);
      this.allEmojis.push(emoji);
    });
  }

  public showInInput(emoji:string): void {
    this.newEmoji.emit(emoji);
  }

  
  search() {
    const filteredList = this.allEmojis.filter(emoji => {
      return emoji.unicodeName.toLowerCase().startsWith(this.searchValue.toLowerCase());
    });
    this.emojiList = filteredList;
  }

}

