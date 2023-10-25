import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
  constructor(public authService: AuthService, public router: Router) {}

  canActivate(
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAdmin() !== true) {
      this.router.navigate(['home', this.authService.userData?.uid, 'list']);
    }
    return true;
  }
}
