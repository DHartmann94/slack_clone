import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-startscreen',
  templateUrl: './startscreen.component.html',
  styleUrls: ['./startscreen.component.scss']
})
export class StartscreenComponent implements OnInit {
  @HostListener('window:resize', ['$event'])

  hideIntro = false;
  toLeft = false;
  workmode = false;
  mobile:boolean = false;

  constructor(private router: Router) {}


  ngOnInit(): void {
    this.checkForScreenWidth();
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

 

  checkForScreenWidth(){
    if (window.innerWidth < 800) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

  onWindowResize(event: Event): void {
    this.checkForScreenWidth();
  }

} 
