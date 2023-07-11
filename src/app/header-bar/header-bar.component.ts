import { Component } from '@angular/core';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent {
  isLogoutContainerOpen: boolean = false;

  openLogoutContainer() {
    this.isLogoutContainerOpen = true;
  }

  closeLogoutContainer() {
    this.isLogoutContainerOpen = false;
  }
}
