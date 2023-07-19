import { Component } from '@angular/core';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Firestore, collection, doc, getDoc } from '@angular/fire/firestore';

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
  statusColor = 'Active';
  isLogoutContainerOpen: boolean = false;
  isProfileCardOpen: boolean = false;
  isEditProfileCardOpen: boolean = false;
  active: boolean = false;
  coll = collection(this.firestore, 'users');


  constructor(public authentication: AuthenticationService, private firestore: Firestore) { }


  async ngOnInit() {
    this.currentUser = localStorage.getItem('currentUser') ?? '';
    await this.getUserData();
    this.colorStatus(); // Call the function to set 'active' based on 'userStatus'
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
        this.colorStatus(); // Call the function to set 'active' based on 'userStatus'
      } else {
        console.log('The document does not exist.');
      }
    } catch (error) {
      console.log('Error retrieving user data:', error);
    }
  }
  
  colorStatus() {
    this.active = this.userStatus === 'Active';
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

