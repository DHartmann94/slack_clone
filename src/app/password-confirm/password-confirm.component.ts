import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../service-moduls/validation.service';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-password-confirm',
  templateUrl: './password-confirm.component.html',
  styleUrls: ['./password-confirm.component.scss']
})
export class PasswordConfirmComponent {
  isChangePassword: boolean = false;
  submitted: boolean = false;
  showSlideInNotification: boolean = false;

  confirmPasswortForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),

    confirmPassword: new FormControl('', [
      Validators.required,
    ]),
  }, { validators: this.validation.matchPassword.bind(this) });

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    public validation: ValidationService, 
    public authentication: AuthenticationService) { }

  /*------ Change-Password ------*/

  /**
   * Asynchronously changes the user's password using the provided 'oobCode' from the query parameters int the url and the new password from the 'confirmPasswordForm'.
   */
  async changePassword() {
    this.submitted = true;
    if (this.confirmPasswortForm.invalid) {
      return;
    }
    this.disableForm();

    const newPassword: string = this.confirmPasswortForm.value.confirmPassword || '';
    const code = this.route.snapshot.queryParams['oobCode'];
    await this.authentication.changePassword(code, newPassword);

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

  disableForm() {
    this.confirmPasswortForm.disable();
    this.isChangePassword = true;
  }

  resetForm() {
    setTimeout(() => {
      this.confirmPasswortForm.reset();
      this.confirmPasswortForm.enable();
      this.isChangePassword = false;
      this.submitted = false;
    }, 3500);
  }


}