import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-startscreen',
  templateUrl: './startscreen.component.html',
  styleUrls: ['./startscreen.component.scss']
})
export class StartscreenComponent implements OnInit {
  hideIntro = true;
  
  
  ngOnInit(): void {
    setTimeout(() => {
        this.hideIntro = false;
    }, 3000);
  }
} 
