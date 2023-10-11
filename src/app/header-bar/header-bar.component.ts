import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { ValidationService } from '../service-moduls/validation.service';
import { Firestore, collection, doc, updateDoc } from '@angular/fire/firestore';
import { UserDataInterface, UserDataService } from '../service-moduls/user.service';
import { ChatBehaviorService } from '../service-moduls/chat-behavior.service';
import { ActivatedRoute } from '@angular/router';
import { ChannelDataInterface } from '../service-moduls/channel.service';
import { Observable, map } from 'rxjs';
import { ChannelDataResolverService } from '../service-moduls/channel-data-resolver.service';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent {
  showIcon = false;
  statusColor = 'Active';
  isLogoutContainerOpen: boolean = false;
  isProfileCardOpen: boolean = false;
  isEditProfileCardOpen: boolean = false;
  isProfilePictureContainerOpen: boolean = false;
  emailExists: boolean = false;
  usernameExists: boolean = false;
  submitted: boolean = false;
  showSlideInNotification: boolean = false;
  receivedChannelData$!: Observable<ChannelDataInterface | null>;
  selectedPictureIndex: number | null = null;
  active: boolean = false;
  coll = collection(this.firestore, 'users');
  profilePictures = ['/assets/profile-pictures/avatar1.png', '/assets/profile-pictures/avatar2.png', '/assets/profile-pictures/avatar3.png', '/assets/profile-pictures/avatar4.png', '/assets/profile-pictures/avatar5.png', '/assets/profile-pictures/avatar6.png'];

  userData: UserDataInterface[] = [];

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


  constructor(
    public userDataService: UserDataService,
    public validation: ValidationService,
    private channelDataResolver: ChannelDataResolverService,
    public authentication: AuthenticationService,
    public chatBehaviorService: ChatBehaviorService,
    private firestore: Firestore,
    private route: ActivatedRoute,
  ) { }

/**
 * Lifecycle hook that is called after Angular has initialized the component.
 * Fetches the current user ID, gets the user data, and sets the status color.
 */
  async ngOnInit() {
    this.getCurrentUserId();
    await this.userDataService.getCurrentUserData(this.userDataService.currentUser);
    this.colorStatus();
    await this.userDataService.getCurrentUserData(this.userDataService.currentUser);
    this.getDataFromChannel();
  }

/**
 * Gets the current user ID from the route parameters and updates the `currentUser` in the `userDataService`.
 */
  getCurrentUserId() {
    // this.currentUser = localStorage.getItem('currentUser') ?? ''; // TEST
    this.route.params.subscribe((params) => {
      this.userDataService.currentUser = params['id'];
    });
  }

  /**
 * Edits the user profile by updating the name and email.
 * @async
 */
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

  /**
 * Edits the user name and updates it in the database.
 * @async
 * @param {string} name - The new name to be updated.
 */
  async editUserName(name: string) {
    if (name === '') {
      return;
    }
    if (this.editNameForm.invalid) {
      return;
    }
    const nameLowerCase = name.toLowerCase() || '';
    this.usernameExists = await this.validation.checkUsernameExists(nameLowerCase);
    if (this.usernameExists) {
      this.resetExistsError('usernameExists');
      return;
    }
    this.disableForm();

    await this.changeFirebase(name, 'name');
    this.userDataService.getCurrentUserData(this.userDataService.currentUser);

    this.showsNotificationAnimation();
    this.resetForm();
  }

  /**
 * Edits the user email and updates it in the database.
 * @async
 * @param {string} email - The new email to be updated.
 * @param {string} password - The user's password for verification.
 */
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
      this.resetExistsError('emailExists');
      return;
    }
    await this.changeUserMail(email, password);
  }

  /**
 * Changes the user email and updates it in the database.
 * @async
 * @param {string} email - The new email to be updated.
 * @param {string} password - The user's password for verification.
 */
  async changeUserMail(email: string, password: string) {
    this.disableForm();
    await this.authentication.changeMail(email, password);
    await this.changeFirebase(email, 'email');
    this.userDataService.getCurrentUserData(this.userDataService.currentUser);

    this.showsNotificationAnimation();
    this.resetForm();
  }

  async getDataFromChannel(): Promise<void> {
    this.receivedChannelData$ = this.channelDataResolver.resolve().pipe(
      map((data: ChannelDataInterface | null) => {
        return data;
      })
    );
  }

  /**
 * Updates the provided value in the database.
 * @async
 * @param {string} newValue - The new value to be updated.
 * @param {string} type - The type of data to be updated ('name' or 'email').
 */
  async changeFirebase(newValue: string, type: string) {
    const userDocRef = doc(this.firestore, 'users', this.userDataService.currentUser);
    try {
      await updateDoc(userDocRef, { [type]: newValue });
    } catch (error) {
      console.error('ERROR update e-Mail:', error);
    }
  }

  /**
 * Sets the `active` property based on the userStatus from `userDataService`.
 */
  colorStatus() {
    this.active = this.userDataService.userStatus === 'Active';
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

  showsNotificationAnimation() {
    this.showSlideInNotification = true;
    setTimeout(() => {
      this.showSlideInNotification = false;
    }, 3000);
  }

  backToChannelMobile() {
    this.chatBehaviorService.hideChannel = false;
    this.chatBehaviorService.hideChat = true;
    this.chatBehaviorService.hideDirectChat = true;
    this.chatBehaviorService.toggleDirectChatIcon = true;
    this.chatBehaviorService.toggleSearchBar = false;
    this.chatBehaviorService.headerMoblieView = false;

    this.chatBehaviorService.isChatOpenResponsive = true;
    this.chatBehaviorService.isThreadOpenResponsive = false;
  }
  /**
 * Saves the selected profile picture to the database.
 * @async
 */
  async saveProfilePicture() {
    if (this.selectedPictureIndex === null) {
      return;
    }
    const userDocRef = doc(this.firestore, 'users', this.userDataService.currentUser);
    const selectedPicture = this.selectedPictureIndex;
    try {
      await updateDoc(userDocRef, { picture: `/assets/profile-pictures/avatar${selectedPicture + 1}.png` });
      this.userDataService.getCurrentUserData(this.userDataService.currentUser);

      this.selectedPictureIndex = null;
      this.closeProfilePictureContainer();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Bildes', error);
    }
  }

  /**
 * Handles the click event on a picture, allowing the user to select or deselect a profile picture.
 * @param {number} index - The index of the picture clicked.
 */
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

  /**
 * Resets the editNameForm and editMailForm to their initial state.
 */
  resetForm() {
    this.editNameForm.enable();
    this.editNameForm.reset();

    this.editMailForm.enable();
    this.editMailForm.reset();
    this.submitted = false;
  }

  resetExistsError(errorType: 'usernameExists' | 'emailExists') {
    setTimeout(() => {
      this[errorType] = false;
    }, 3000);
  }

}