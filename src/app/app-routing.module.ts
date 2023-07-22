import { ChatComponent } from './chat/chat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { BoardComponent } from './board/board.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { ChannelsComponent } from './channels/channels.component';
import { ThreadsComponent } from './threads/threads.component';
import { UserProfileCardComponent } from './user/user-profile-card/user-profile-card.component';
import { EditUserProfileCardComponent } from './user/edit-user-profile-card/edit-user-profile-card.component';
import { LogoutUserProfileCardComponent } from './user/logout-user-profile-card/logout-user-profile-card.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { AuthActionComponent } from './auth-action/auth-action.component';
import { StartscreenComponent } from './startscreen/startscreen.component';

const routes: Routes = [
  { path: '', component: StartscreenComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'reset-password', component: PasswordResetComponent },
  { path: 'auth-action', component: AuthActionComponent },
  { path: 'board', component: BoardComponent, children: [
    { path: 'header', component: HeaderBarComponent },
    { path: 'channels', component: ChannelsComponent },
    { path: 'chat', component: ChatComponent },
    { path: 'threads', component: ThreadsComponent },
  ]},
  { path: 'user', component: UserProfileCardComponent},
  { path: 'edit-user', component: EditUserProfileCardComponent},
  { path: 'logout', component: LogoutUserProfileCardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
