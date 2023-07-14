import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'slack_clone';
  isLogoutContainerOpen = false;
  isProfileCardOpen = false;
  isEditProfileCardOpen = false;

  onlyLogo = false;

  ngOnInit(): void {
    setTimeout(() => {
        this.onlyLogo = true;
    }, 3000);
  }
}
