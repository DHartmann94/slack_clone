import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss']
})

export class ChannelsComponent implements OnInit {

  showFiller = false;

  constructor() {

  }

  ngOnInit(): void {
    
  }
  toggle() {
    this.showFiller = !this.showFiller;
  }
}
