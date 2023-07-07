import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { BoardComponent } from './board/board.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { ChannelsComponent } from './channels/channels.component';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';

const routes: Routes = [ 
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'board', component: BoardComponent, children: [
    { path: 'header', component: HeaderBarComponent },
    { path: 'channels', component: ChannelsComponent }
  ]},
  { path: 'user-profile-card', component: UserProfileCardComponent}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }