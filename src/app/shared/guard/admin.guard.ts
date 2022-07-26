import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean{
       let user = JSON.parse(localStorage.getItem('user')!)
      if( user.uid !== "bmm4sSFQOQOmshnSIaVzNj5yqYu2" && 
      user.uid !== "nPU3BmH8SfTSPZfGRaINNpG9LUr2" 
      && user.uid !== "nPU3BmH8SfTSPZfGRaINNpG9LUr2") {
          alert("no estas autorizado");
       this.router.navigate(['dashboard']);
      }
    return true;
  }
  
}
