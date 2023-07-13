import { Component } from '@angular/core';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent {
  isLogoutContainerOpen: boolean = false;
  isProfileCardOpen: boolean = false;
  isEditProfileCardOpen: boolean = false;


  openLogoutContainer() {
    this.isLogoutContainerOpen = true;
  }

  closeLogoutContainer() {
    this.isLogoutContainerOpen = false;
  }

  openUserProfile() {
    this.isProfileCardOpen = true;
    this.isLogoutContainerOpen = false;
  }

  closeUserProfile() {
    this.isProfileCardOpen = false;
  }

  openEditProfileCard() {
    this.isEditProfileCardOpen = true;
    this.isProfileCardOpen = false;
  }

  closeEditUserProfile() {
    this.isEditProfileCardOpen = false;
  }
}

