import { Component, EventEmitter, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-emojis',
  templateUrl: './emojis.component.html',
  styleUrls: ['./emojis.component.scss']
})

export class EmojisComponent implements OnInit{

  constructor() {}

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


  /**
   * Lifecycle hook called after Angular initializes the component.
   */
  ngOnInit(): void {
    this.getEmojis();
  }

   /**
   * Fetches emojis from the API.
   */
  getEmojis() {
    fetch(this.url)
      .then(res => res.json())
      .then(data => this.loadEmoji(data));
  }

   /**
   * Loads emojis from the API response into the emojiList and allEmojis arrays.
   * @param {[]} data - The data containing emojis from the API response.
   */
  loadEmoji(data:[]) {
    data.forEach(emoji => {
      this.emojiList.push(emoji);
      this.allEmojis.push(emoji);
    });
  }

    /**
   * Emits the selected emoji to the parent component using the newEmoji EventEmitter.
   * @param {string} emoji - The selected emoji.
   */
  public showInInput(emoji:string): void {
    this.newEmoji.emit(emoji);
  }

   /**
   * Filters the list of emojis based on the searchValue.
   */
  search() {
    const filteredList = this.allEmojis.filter(emoji => {
      return emoji.unicodeName.toLowerCase().includes(this.searchValue.toLowerCase());
    });
    this.emojiList = filteredList;
  }
}

