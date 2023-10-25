import { Injectable, NgZone } from '@angular/core';
import {
  Role,
  UserExtended,
  isAdminRole,
  isSuperAdminRole,
} from '../models/user';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any; // Save logged in user data
  userRole: Role = Role.Guest;
  constructor(
    private loaderService: LoaderService,
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user.toJSON();
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        localStorage.setItem('user', 'null');
      }
    });
  }

  setCurrentUserInfo(currentUser: any) {
    this.userRole = currentUser?.role ?? Role.Guest;
    this.userData.displayName = currentUser?.displayName;
    this.userData.photoURL = currentUser?.photoURL;
  }

  // Sign in with email/password
  signIn(email: string, password: string) {
    this.loaderService.showLoader();

    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.setUserData(result.user);
        this.afAuth.authState.pipe(take(1)).subscribe((user) => {
          this.loaderService.hideLoader();
          if (user) {
            this.router.navigate(['home', user.uid, 'list']);
          }
        });
      })
      .catch((error) => {
        this.loaderService.hideLoader();
        window.alert(error.message);
      });
  }

  // Sign up with email/password
  signUp(
    email: string,
    password: string,
    displayName: string,
    phoneNumber: string
  ) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        if (result && result.user) {
          this.sendVerificationMail();
          this.setUserData(result.user, { displayName, phoneNumber });
        }
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  // Send email verification when new user sign up
  sendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }

  // Reset Forggot password
  forgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return user !== null && user.emailVerified !== false ? true : false;
  }

  isAdmin() {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return (
      user !== null &&
      user.emailVerified !== false &&
      isAdminRole(this.userRole)
    );
  }
  get isSuperAdmin(): boolean {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return (
      user !== null &&
      user.emailVerified !== false &&
      isSuperAdminRole(this.userRole)
    );
  }

  // Sign in with Google
  googleAuth() {
    return this.authLogin(new auth.GoogleAuthProvider()).then(() => {
      this.afAuth.authState.pipe(take(1)).subscribe((user) => {
        if (user) {
          this.router.navigate(['home', user.uid, 'list']);
        }
      });
    });
  }

  // Auth logic to run auth providers
  authLogin(provider: any) {
    this.loaderService.showLoader();
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.setUserData(result.user, { provider: 'google' });
        this.loaderService.hideLoader();
      })
      .catch((error) => {
        this.loaderService.hideLoader();
        window.alert(error);
      });
  }

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  setUserData(user: any, extra: any = {}) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: Partial<UserExtended> = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
    };
    if (user.photoURL) {
      userData.photoURL = user.photoURL;
    }
    if (user.displayName || extra?.displayName) {
      userData.displayName = user.displayName ?? extra?.displayName;
    }
    if (user.phoneNumber || extra?.phoneNumber) {
      userData.phoneNumber = user.phoneNumber ?? extra?.phoneNumber;
    }
    if (extra?.provider) {
      userData.provider = extra.provider;
    }
    return new Promise((resolve, reject) => {
      userRef.get().subscribe(
        (snapshot) => {
          if (snapshot.exists) {
            userRef.update(userData);
          } else {
            userRef.set(userData);
          }
          resolve(void 0);
        },
        () => {
          reject();
        }
      );
    });
    // return userRef.set(userData, {
    //   merge: true,
    // });
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }
}
