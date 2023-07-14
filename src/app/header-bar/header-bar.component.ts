import { Component } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Firestore, addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';



@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent {
  userData: UserDataInterface[] = [];



  constructor(public authentication: AuthenticationService, private userDataService: UserDataService, private firestore: Firestore) { }

  ngOnInit() {
    this.getUserData();
  }

  getUserData() {
    this.userDataService.getUserData().subscribe((userData: UserDataInterface[]) => {
      this.userData = userData;
    });
  }

  async getUserData2() {
    debugger
    if (this.authentication.user !== null) {
      const userDocRef = doc(this.firestore, 'users', this.authentication.user.id);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        console.log(userData);
      } else {
        console.log('No such document!');
      }
    }
  }











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


  closeContainers() {
    this.isLogoutContainerOpen = false;
    this.isProfileCardOpen = false;
    this.isEditProfileCardOpen = false;
  }
}

