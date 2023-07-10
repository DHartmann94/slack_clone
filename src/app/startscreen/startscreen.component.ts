import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-startscreen',
  templateUrl: './startscreen.component.html',
  styleUrls: ['./startscreen.component.scss']
})
export class StartscreenComponent implements OnInit {
  hideIntro = false;
  toLeft = false;
  workmode = false;


  ngOnInit(): void {
    setTimeout(() => {
      this.hideIntro = true;
      this.toLeft = true;
      this.hideBG();
    }, 2000);
  }

  hideBG() {
    setTimeout(() => {
      this.workmode = true;
    }, 1000);
  }


} 
