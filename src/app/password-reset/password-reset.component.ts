import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../service-moduls/validation.service';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent {
  isSendMail: boolean = false;
  submitted: boolean = false;
  showSlideInNotification: boolean = false;
  emailExists: boolean = true;

  resetPasswortForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    ]),
  });


  constructor(
    private router: Router, 
    public validation: ValidationService,  
    public authentication: AuthenticationService) { }

  /*------ Send-Mail ------*/

  /**
   * Asynchronously sends a change password email to the provided email address.
   * It checks if the email address exists, and if so, sends the email and shows a notification animation.
   */
  async sendMail() {
    this.submitted = true;
    if (this.resetPasswortForm.invalid) {
      return;
    }
    this.disableForm();

    const emailLowerCase: string = this.resetPasswortForm.value.email?.toLowerCase() || '';
    this.emailExists = await this.validation.checkEmailExists(emailLowerCase);
    if (!this.emailExists) {
      this.resetPasswortForm.enable();
      this.isSendMail = false;
      this.resetEmailExistsError();
      return;
    }

    await this.authentication.sendChangePasswordMail(emailLowerCase);

    this.showsNotificationAnimation();
    this.resetForm();
    this.router.navigateByUrl("/sign-in");
  }

  /*------ Help functions ------*/
  showsNotificationAnimation() {
    this.showSlideInNotification = true;
    setTimeout(() => {
      this.showSlideInNotification = false;
    }, 3000);
  }

  resetEmailExistsError() {
    setTimeout(() => {
      this.emailExists = false;
    }, 3000);
  }

  disableForm() {
    this.resetPasswortForm.disable();
    this.isSendMail = true;
  }

  resetForm() {
    setTimeout(() => {
      this.resetPasswortForm.reset();
      this.resetPasswortForm.enable();
      this.isSendMail = false;
      this.submitted = false;
    }, 3500);
  }

  
}