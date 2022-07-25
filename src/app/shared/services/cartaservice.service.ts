import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Card } from 'src/app/components/card/card.component';
import { PartidaService } from './partida.service';
import {tap} from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class CartaserviceService {

  private cartaURL = `${environment.baseUrl}/api/carta/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient, private partida: PartidaService) { }
  
  refresh(){
   return  this.partida.getRefresh$()
  }
  getAll() : Observable<any>{
    return this.http.get(this.cartaURL, this.httpOptions)
    
  }
  crearNuevaCarta( carta: Card ) : Observable<any> {
    return this.http.post(this.cartaURL, carta, this.httpOptions)
    .pipe(tap(() => this.refresh().next()))
  }

  eliminarCarta( cartaId: string ) : Observable<any>{
    return this.http.delete(`${this.cartaURL}${cartaId}`, this.httpOptions)
  }
  editCarta( cartaId: string , carta: Card ): Observable<any>{
       return this.http.put(`${this.cartaURL}${cartaId}`, carta , this.httpOptions)
       .pipe(tap(() => this.refresh().next()))
  }

}
