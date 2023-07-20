import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { ValidationService } from '../service-moduls/validation.service';
import { Firestore, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';

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
  userPicture = '';
  showIcon = false;
  statusColor = 'Active';
  isLogoutContainerOpen: boolean = false;
  isProfileCardOpen: boolean = false;
  isEditProfileCardOpen: boolean = false;
  isProfilePictureContainerOpen: boolean = false;
  active: boolean = false;
  coll = collection(this.firestore, 'users');
  profilePictures = ['/assets/profile-pictures/avatar1.png', '/assets/profile-pictures/avatar2.png', '/assets/profile-pictures/avatar3.png', '/assets/profile-pictures/avatar4.png', '/assets/profile-pictures/avatar5.png', '/assets/profile-pictures/avatar6.png'];


  constructor(public validation: ValidationService, public authentication: AuthenticationService, private firestore: Firestore) { }


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
        this.userPicture = userData['picture'];
        this.colorStatus(); // Call the function to set 'active' based on 'userStatus'
      } else {
        console.log('The document does not exist.');
      }
    } catch (error) {
      console.log('Error retrieving user data:', error);
    }
  }

  editName = new FormGroup({
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(25),
      Validators.pattern(/^[a-zA-Z]+\s[a-zA-Z]+$/),
    ]),
  });

  editMail = new FormGroup({
    email: new FormControl('', [
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),
  });

  emailExists: boolean = false;

  async editUserProfile() {
    let name = this.editName.value.name ?? '';
    let email = this.editMail.value.email?.toLowerCase() || '';
    let password = this.editMail.value.password ?? '';
    await this.editUserName(name);
    await this.editUserEmail(email, password);
  }

  openPictureContainer() {
    this.isProfilePictureContainerOpen = true;
  }

  changeProfilePicture() {

  }

  async editUserName(name: string) {
    if (name === '') {
      return;
    }
    if (this.editName.invalid) {
      console.log('Falsche Eingabe Mail');
      return;
    }
    
    await this.changeFirebase(name, 'name');
    this.getUserData();
  }

  async editUserEmail(email: string, password: string) {
    if (email === '' || password === '') {
      return;
    }
    if (this.editMail.invalid) {
      console.log('Falsche Eingabe Mail');
      return;
    }
    this.emailExists = false;
    this.emailExists = await this.validation.checkEmailExists(email);
    if (this.emailExists) {
      console.log('Email existiert!');
      return;
    }

    await this.authentication.changeMail(email, password);
    await this.changeFirebase(email, 'email');
    this.getUserData();
  }

  async changeMailFirebase(newEmail: string) {
    const userDocRef = doc(this.firestore, 'users', this.currentUser);
    try {
      await updateDoc(userDocRef, { email: newEmail });
      console.log('E-Mail erfolgreich aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der E-Mail:', error);
    }
  }

  async changeFirebase(newValue: string, type: string) {
    const userDocRef = doc(this.firestore, 'users', this.currentUser);
    try {
      await updateDoc(userDocRef, { [type]: newValue });
      console.log('E-Mail erfolgreich aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der E-Mail:', error);
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

  showEditIcon() {
    this.showIcon = true;
  }

  hideEditIcon() {
    this.showIcon = false;
  }
}

