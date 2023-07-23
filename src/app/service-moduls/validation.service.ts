import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { getAuth, fetchSignInMethodsForEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /*------ Validation-Functions ------*/

  /**
   * Asynchronously search of the email address in the authenticator.
   * @param emailLowerCase - The email address that the user entered.
   * @returns {boolean} - True if the email address exists.
   */
  async checkEmailExists(emailLowerCase: string) {
    const auth = getAuth();

    try {
      const emailResult = await fetchSignInMethodsForEmail(auth, emailLowerCase);

      if (emailResult.length > 0) {
        return true;
      }

      return false;;

    } catch (error) {
      console.log('Error: ', error);
      return true;
    }
  }

  /**
   * Validates if the password and confirm password fields match.
   * @param control - The form control representing the entire form group.
   * @returns {mismatch: true | null} - Returns an object with the 'mismatch' property set to true if the password and confirm password do not match, otherwise returns null.
   */
  matchPassword(control: AbstractControl): ValidationErrors | null {
    const passwordControl = control.get("password");
    const confirmPasswordControl = control.get("confirmPassword");

    if (passwordControl && confirmPasswordControl) {
      const password: string = passwordControl.value;
      const confirmPassword: string = confirmPasswordControl.value;

      if (password !== confirmPassword) {
        return { mismatch: true };
      }
    }

    return null;
  }
}
