import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../service-moduls/authentication.service';

@Component({
  selector: 'app-email-verification-confirm',
  templateUrl: './email-verification-confirm.component.html',
  styleUrls: ['./email-verification-confirm.component.scss']
})
export class EmailVerificationConfirmComponent implements OnInit {
  mode: any;
  loading: boolean = false;


  constructor(private route: ActivatedRoute, public authentication: AuthenticationService) { }

  ngOnInit(): void {
    this.checkMode();
  }

  /**
   * Check the mode in the url.
   * If the mode is 'verifyEmail', it calls the 'handleVerifyEmail' method from the 'authentication' service.
   */
  async checkMode() {
    this.route.queryParams.subscribe(async params => {
      this.mode = '';
      this.mode = params['mode'];

      if (this.mode === 'verifyEmail') {
        this.loading = true;
        await this.authentication.handleVerifyEmail();
        this.loading = false;
      }
    });
  }


}