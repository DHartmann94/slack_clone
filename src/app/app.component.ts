import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'slack_clone';
  isLogoutContainerOpen: boolean = false;
  isProfileCardOpen: boolean = false;
  isEditProfileCardOpen: boolean = false;

  hideStartscreen = false;

  closeContainers() {
    this.isLogoutContainerOpen = false;
    this.isProfileCardOpen = false;
    this.isEditProfileCardOpen = false;
  }

  // ngOnInit(): void {
  //   setTimeout(() => {
  //       this.hideStartscreen = true;
  //   }, 3000);
  // }
}
