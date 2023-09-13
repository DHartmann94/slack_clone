//<-----App----->//
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment.prod';

//<-----Modules----->//
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';

//<-----Components----->//
import { StartscreenComponent } from './startscreen/startscreen.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { BoardComponent } from './board/board.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { ChannelsComponent } from './channels/channels.component';
import { ThreadsComponent } from './threads/threads.component';
import { ChatComponent } from './chat/chat.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { PasswordConfirmComponent } from './password-confirm/password-confirm.component';
import { AuthActionComponent } from './auth-action/auth-action.component';
import { EmailVerificationConfirmComponent } from './email-verification-confirm/email-verification-confirm.component';
import { EmojisComponent } from './emojis/emojis.component';
import { ImprintComponent } from './imprint/imprint.component';
import { LegalComponent } from './legal/legal.component';
import { DirectMessageToUserComponent } from './direct-message-to-user/direct-message-to-user.component';

@NgModule({
  declarations: [
    AppComponent,
    StartscreenComponent,
    SignInComponent,
    SignUpComponent,
    BoardComponent,
    HeaderBarComponent,
    ChannelsComponent,
    ThreadsComponent,
    ChatComponent,
    PasswordResetComponent,
    PasswordConfirmComponent,
    AuthActionComponent,
    EmailVerificationConfirmComponent,
    EmojisComponent,
    ImprintComponent,
    LegalComponent,
    DirectMessageToUserComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSidenavModule,
    MatButtonModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatRadioModule,
    MatMenuModule,
    MatIconModule,
    MatExpansionModule,
    HttpClientModule,
    MatSelectModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
  providers: [
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
