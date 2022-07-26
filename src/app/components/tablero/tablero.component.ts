import {
 
  Component,
  DoCheck,
  OnInit,
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { Card } from '../card/card.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ApuestaModel } from 'src/app/interface/apuesta.interface';
import { PartidaService } from 'src/app/shared/services/partida.service';

import { Jugador } from 'src/app/interface/jugador';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import {  take, takeWhile } from 'rxjs/operators';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.css'],
})
export class TableroComponent implements OnInit, DoCheck {
  tablero: { status: boolean } = { status: false };
  partidaId!: string;
  ronda: number = 0;
  apuestas!: { jugadorId: string; carta: Card }[];
  mazo: Card[] = [];
  apuestadrop: Card[] = [];
  jugadores: Jugador[] = [];
  partida: any;
  jugadoruid: any;
  jugadorInfo: any;
  timeInterval: number = 1000;
  time!: number;
  subscripcion!: Subscription;
  constructor(
    public authService: AuthService,
    private partidaService: PartidaService,
    private rutaActiva: ActivatedRoute
  ) {}

  ngDoCheck(): void {
    if (this.apuestas.length === this.partida.jugadores.length) {
      this.tablero.status = true;
    }
  }

  ngOnInit(): void {
    this.partidaId = this.rutaActiva.snapshot.paramMap.get('idPartida')!;
    this.jugadoruid = JSON.parse(localStorage.getItem('user')!).uid;
    this.getPartidaPorId();

    this.subscripcion = this.partidaService
      .getRefresh$()
      .subscribe(() => this.ganadorRonda());
  }

  ngAfterViewInit() {
    this.partidaService
      .getPartidaporId(this.partidaId)
      .subscribe((data: any) => {
        data.jugadores.length > 1
          ? this.onTime()
          : Swal.fire(`<h2>El ganador del juego fue: ${this.partida.ronda.ultimoGanador} </h2><hr/>
      <span style='font-size:100px;'>&#129321;</span>`);
      this.jugadores = data.jugadores;
      });
      // let refData = 2000;
      // interval(10000).pipe(        
      //   (takeWhile(() =>  refData -- > 0)))
      //   .subscribe(() => this.partidaService.getPartidaporId(this.partidaId))
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else if (
      this.apuestas.filter((item) => item.jugadorId === this.jugadorInfo.id)
        .length > 0
    ) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      Swal.fire(`Ya hiciste tu apuesta, espera a los demas jugadores`);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.newArray();

      let cartaApostada: Card = event.container.data[0];

      

      this.enviarApuesta(this.partidaId, cartaApostada);
      this.renderTableroApuestas();
    }
  }

  onTime() {
    let fina = this.partida.ronda.isTimerOn;
    interval(1000)
      .pipe(takeWhile(() => fina-- > 0))
      .subscribe({
        next: () => {
          this.time--;
        },

        complete: () => {
          this.tomarCartaRandom();
          this.ganadorRonda();
        },
      });
  }
  //!TOMAR CARTA AL FINALIZAR RELOJ
  tomarCartaRandom() {
    if (this.mazo.length > 0 && this.filtrarJugadorEnapuesta().length === 0) {
      this.enviarApuesta(this.partidaId, this.mazo[0]);
    }
  }

  //!PREGUNTAR SI HAY APUESTA DEL JUGADOR
  filtrarJugadorEnapuesta() {
    return this.apuestas.filter(
      (item) => item.jugadorId === this.jugadorInfo.id
    );
  }

  //!INFO DE LOS MAZOS
  newArray() {
    localStorage.setItem('mazo', JSON.stringify(this.mazo));
    localStorage.setItem('apuestadrop', JSON.stringify(this.apuestadrop));
  }

  imprimir() {
    this.renderTableroApuestas();
    this.getJugadorInfo();
    this.getMazo();
    this.time = this.partida.ronda.isTimerOn;
  }

  getPartidaPorId(): TableroComponent {
    this.partidaService.getPartidaporId(this.partidaId).subscribe((item) => {
      this.partida = item;

      this.imprimir();
    });
    return this;
  }

  renderTableroApuestas() {
    this.partida.ronda.apuestas.length > 0
      ? (this.apuestas = this.partida.ronda.apuestas)
      : (this.apuestas = []);
    this.ronda = this.partida.ronda.numero;
  }
  getJugadorInfo() {
    this.partida.jugadores.forEach((jugador: Jugador) => {
      if (jugador.uid === this.jugadoruid) {
        this.jugadorInfo = jugador;
      }
    });
  }

  getMazo() {
    this.mazo = this.jugadorInfo.cartas;
  }

  enviarApuesta(partidaId: string, carta: Card) {
    const apuesta: ApuestaModel = {
      jugadorId: this.jugadorInfo.id,
      carta: {
        id: carta.id,
        nombre: carta.nombre,
        xp: carta.xp,
        imagen: carta.imagen,
      },
    };
    this.partidaService.enviarApuesta(partidaId, apuesta).subscribe({error: (error)=> console.log(error)});
  }

  ganadorRonda(idPartida: string = this.partidaId) {
    this.tablero.status
      ? this.partidaService.ganadorRonda(idPartida).subscribe({
          next: (item) =>
            Swal.fire(`<h2>El ganador de la ronda: ${item.ronda.ultimoGanador} </h2></hr>
    <span style='font-size:100px;'>&#128526;</span>`),
          complete: () => this.getPartidaPorId(),
        })
      : this.getPartidaPorId();

    if (this.mazo.length === 0) {
      alert('Has perdido noob');
    }
  }
}
