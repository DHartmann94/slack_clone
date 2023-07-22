import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-emojis',
  templateUrl: './emojis.component.html',
  styleUrls: ['./emojis.component.scss']
})

export class EmojisComponent implements OnInit{
  searchValue: string = '';
  myEmojis: any;
  emojiSelectorIcon = document.getElementById('emojiSelectorIcon');
  emojiSelector = document.getElementById('emojiSelector');
  emojiList = [];
  allEmojis = [];
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
    console.log(this.emojiList);
    
  }
  

  search() {
    const filteredList = this.allEmojis.filter(emoji => {
      // return emoji.unicodeName.toLowerCase().includes(this.searchValue.toLowerCase());
    });
    this.emojiList = filteredList;
  }

}

