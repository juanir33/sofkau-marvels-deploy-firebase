import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
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
      if( user.uid !== "GtEwNly8sYQROy1r2EW5ThmG8RG3" &&
      user.uid !== "nPU3BmH8SfTSPZfGRaINNpG9LUr2" && 
      user.uid !== "bmm4sSFQOQOmshnSIaVzNj5yqYu2") {
        Swal.fire("No estas autorizado a ingresar a esta pagina volver");
        this.router.navigate(['dashboard'])
      }
    return true;
  }
  
}
