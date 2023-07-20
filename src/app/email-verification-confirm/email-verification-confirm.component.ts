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


  constructor(private route: ActivatedRoute, public authentication: AuthenticationService) { }

  ngOnInit(): void {
    this.checkMode();
  }

  async checkMode() {
    this.route.queryParams.subscribe(params => {
      this.mode = '';
      this.mode = params['mode'];
      
      if (this.mode === 'verifyEmail') {
        this.authentication.handleVerifyEmail();
      }
    });
  }



}
