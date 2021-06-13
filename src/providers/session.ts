import { Events } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { LastUser } from '../models/last_user';

@Injectable()
export class Session {
    public tempoLimiteSessao : number = 90; // Em minutos

    constructor(
        private storage: StorageService,
        private auth : AuthService,
        public events: Events,
    ) {}

  public  verificarSessao() : any{
    // Seta o rootPage diretamente para a tela de login se
    // o usuário não estiver maislogado
    let localUser = this.storage.getLocalUser();
    if (!(localUser && localUser.email)) {
      console.log("###### 1");
      //this.auth.logout();
      //this.navCtrl.setRoot('HomePage');
      return false; // sessão inválida
    } else {
      console.log("###### 2");
      let ultimoAcesso :LastUser = <LastUser> this.storage.getLastAccess();
      let s : string = ultimoAcesso.lastAccess;
      let d1 : Date = new Date(s);
      let d2 : Date = new Date(Date.now());
      let qtdMinutos : number = this.calcularDiferenca(d1, d2);
      console.log(">>> Qtd minutos: " + qtdMinutos);
      if ((ultimoAcesso) && ( qtdMinutos > this.tempoLimiteSessao )) {
        console.log("###### 3");
        // seta o último acesso com o momento atual para ele ter ponto de saída
          ultimoAcesso.lastAccess = d1;
          this.storage.setLastAccess(ultimoAcesso);
          this.auth.logout();
          this.events.publish('user:loggedout');
          //this.navCtrl.setRoot('HomePage');
          return false; // sessão inválida
      } else { 
        console.log("###### 4");
        return true; // sessão válida
      }
    }
  }

  public calcularDiferenca(dateTime1 : Date, dateTime2 : Date) : number {
    var diff = Math.abs(dateTime1.getTime() - dateTime2.getTime());
    var qtdMinutos = Math.ceil(diff / (1000 * 60 )); 
    return qtdMinutos;
  }
}