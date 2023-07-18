import { Component } from '@angular/core';
import { UserDataService, UserDataInterface } from '../service-moduls/user-data.service';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Firestore, collection, collectionData, doc, docData, updateDoc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent {
  currentUser: string = '';
  userName = '';
  userEmail = '';
  userStatus = '';
  isLogoutContainerOpen: boolean = false;
  isProfileCardOpen: boolean = false;
  isEditProfileCardOpen: boolean = false;
  active: boolean = false;
  coll = collection(this.firestore, 'users');


  constructor(public authentication: AuthenticationService, private firestore: Firestore) { }


  async ngOnInit() {
    this.currentUser = localStorage.getItem('currentUser') ?? '';
    await this.getUserData();
  }


  async getUserData() {
    try {
      const userDocRef = doc(this.firestore, 'users', this.currentUser);
      const docSnapshot = await getDoc(userDocRef);
      
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        console.log('User data:', userData);
        this.userName = userData['name']; 
        this.userEmail = userData['email']; 
        this.userStatus = userData['status']; 
      } else {
        console.log('The document does not exist.');
      }
    } catch (error) {
      console.log('Error retrieving user data:', error);
    }
  }


  colorStatus() {
    if (this.userStatus == 'Active') {
      this.active = true;
    }
    if (this.userStatus == 'Inactive') {
      this.active = false;
    }
  }


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

