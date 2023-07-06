import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TestComponent } from './test/test.component';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environments } from 'src/environments/environment.prod';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    UserProfileCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    provideFirebaseApp(() => initializeApp(environments.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
