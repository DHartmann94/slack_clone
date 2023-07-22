import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-startscreen',
  templateUrl: './startscreen.component.html',
  styleUrls: ['./startscreen.component.scss']
})
export class StartscreenComponent implements OnInit {
  hideIntro = false;
  toLeft = false;
  workmode = false;

  constructor(private router: Router) {}


  ngOnInit(): void {
    setTimeout(() => {
      this.hideIntro = true;
      this.toLeft = true;
      this.hideBG();
    }, 2000);
  }

  hideBG() {
    setTimeout(() => {
      //this.workmode = true;
      this.router.navigateByUrl("/sign-in");
    }, 1000);
  }
} 
