import { Component } from '@angular/core';
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
  emailExists: boolean = false;
  submitted: boolean = false;
  selectedPictureIndex: number | null = null;
  active: boolean = false;
  coll = collection(this.firestore, 'users');
  profilePictures = ['/assets/profile-pictures/avatar1.png', '/assets/profile-pictures/avatar2.png', '/assets/profile-pictures/avatar3.png', '/assets/profile-pictures/avatar4.png', '/assets/profile-pictures/avatar5.png', '/assets/profile-pictures/avatar6.png'];

  editNameForm = new FormGroup({
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(25),
      Validators.pattern(/^[a-zA-Z-]+\s[a-zA-Z-]+$/),
    ]),
  });

  editMailForm = new FormGroup({
    email: new FormControl('', [
      Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),
  });


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

  async editUserProfile() {
    let name = this.editNameForm.value.name ?? '';
    let email = this.editMailForm.value.email?.toLowerCase() || '';
    let password = this.editMailForm.value.password ?? '';
    await this.editUserName(name);
    await this.editUserEmail(email, password);
  }

  openPictureContainer() {
    this.isProfilePictureContainerOpen = true;
  }

  async editUserName(name: string) {
    if (name === '') {
      return;
    }
    if (this.editNameForm.invalid) {
      return;
    }
    this.disableForm();

    await this.changeFirebase(name, 'name');
    this.getUserData();

    this.resetForm();
  }

  async editUserEmail(email: string, password: string) {
    if (email === '') {
      return;
    }
    if (password === '') {
      this.submitted = true;
      return;
    }
    if (this.editMailForm.invalid) {
      return;
    }
    this.emailExists = false;
    this.emailExists = await this.validation.checkEmailExists(email);
    if (this.emailExists) {
      this.resetEmailExistsError();
      return;
    }

    await this.changeUserMail(email, password);
  }

  async changeUserMail(email: string, password: string) {
    this.disableForm();
    await this.authentication.changeMail(email, password);
    await this.changeFirebase(email, 'email');
    this.getUserData();
    this.resetForm();
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

  closeProfilePictureContainer() {
    this.isProfilePictureContainerOpen = false;
  }

  async saveProfilePicture() {
    if (this.selectedPictureIndex === null) {
      return;
    }
    const userDocRef = doc(this.firestore, 'users', this.currentUser);
    const selectedPicture = this.selectedPictureIndex;
    try {
      await updateDoc(userDocRef, { picture: `/assets/profile-pictures/avatar${selectedPicture + 1}.png` });
      this.getUserData();
      console.log('Bild erfolgreich aktualisiert.', selectedPicture);

      this.selectedPictureIndex = null;
      this.closeProfilePictureContainer();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Bildes', error);
    }
  }

  onPictureClick(index: number) {
    if (this.selectedPictureIndex === null) {
      this.selectedPictureIndex = index;
    } else if (this.selectedPictureIndex === index) {
      this.selectedPictureIndex = null;
    } else {
      this.selectedPictureIndex = index;
    }
  }

  disableForm() {
    this.editNameForm.disable();
    this.editMailForm.disable();
  }

  resetForm() {
    this.editNameForm.enable();
    this.editNameForm.reset();

    this.editMailForm.enable();
    this.editMailForm.reset();
    this.submitted = false;
  }

  resetEmailExistsError() {
    setTimeout(() => {
      this.emailExists = false;
    }, 3000);
  }

}