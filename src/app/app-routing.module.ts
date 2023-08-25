import { NgModule } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { BoardComponent } from './board/board.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { AuthActionComponent } from './auth-action/auth-action.component';
import { StartscreenComponent } from './startscreen/startscreen.component';
import { ImprintComponent } from './imprint/imprint.component';
import { LegalComponent } from './legal/legal.component';

const routes: Routes = [
  { path: '', component: StartscreenComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'reset-password', component: PasswordResetComponent },
  { path: 'auth-action', component: AuthActionComponent },
  { path: 'board/:id', component: BoardComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'legal', component: LegalComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
