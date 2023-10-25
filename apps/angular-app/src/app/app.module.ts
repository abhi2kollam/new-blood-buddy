import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
// components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';

import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './shared/services/auth.service';
import { EditDonorComponent } from './components/edit-donor/edit-donor.component';
import { DonorListComponent } from './components/donor-list/donor-list.component';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { UserListComponent } from './components/user-list/user-list.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { RequestListComponent } from './components/request-list/request-list.component';
import { DataResolver } from './shared/guard/data-resolver';
import { TimeAgoPipe } from './shared/pipes/time-ago.pipe';
import { DialogService } from './shared/services/dialog-service';
import { LoaderService } from './shared/services/loader.service';
import { LoaderComponent } from './shared/components/loader.component';
import { SegmentedFilterPipe } from './shared/pipes/segmented-filter.pipe';
import { LocListComponent } from './components/loc-list/loc-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    EditDonorComponent,
    DonorListComponent,
    FilterPipe,
    TimeAgoPipe,
    SegmentedFilterPipe,
    UserListComponent,
    EditUserComponent,
    RequestListComponent,
    LoaderComponent,
    LocListComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AppRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      toastClass: 'ngx-toastr full-width-toastr',
      tapToDismiss: true,
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [AuthService, DataResolver, DialogService, LoaderService],
  bootstrap: [AppComponent],
})
export class AppModule {}
