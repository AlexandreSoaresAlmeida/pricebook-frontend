import { HistoricoAcessoDTO } from './../../models/historico.acesso.dto';
import { ClienteService } from './../../services/domain/cliente.service';
import { ClienteDTO } from './../../models/cliente.dto';

import { Component } from '@angular/core';
import { NavController, MenuController, Events, Platform, ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular/navigation/ionic-page';
import { CredenciaisDTO } from '../../models/credenciais.dto';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { SettingsProvider } from './../../providers/settings/settings';
import { API_CONFIG } from '../../config/api.config';
import { LastUser } from '../../models/last_user';
import { HistoricoAcessoService } from '../../services/domain/historico-acesso.service';
import { SessaoFinalizada } from '../../models/sessao_finalizada';
import { versionNumber } from '../../version';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  cliente : ClienteDTO;

  creds: CredenciaisDTO = {
    email: "",
    senha: "",
    novaSenha: "",
    novaSenhaConfirmacao: ""
  };

  titleApp : String;
  imgLogo : String;
  theme : String;
  register: String;

  selectedTheme : String;

  lastUser : LastUser;

  versionNumber : string = versionNumber;

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public auth: AuthService,
    public storage: StorageService,
    public clienteService: ClienteService,
    public events : Events,
    private settings : SettingsProvider,
    public platform: Platform,
    public historicoAcesso : HistoricoAcessoService,
    private toastCtrl: ToastController,
    ) {
      this.settings.getActiveTheme().subscribe(val => this.selectedTheme = val);
      this.titleApp = `${API_CONFIG.titleApp}`;
      this.imgLogo = `${API_CONFIG.imgPath}/${API_CONFIG.imgLogo}`;
      this.theme = `${API_CONFIG.theme}`;
      this.register = `${API_CONFIG.register}`;
      this.settings.setActiveTheme(this.theme); // invoca o tema definido
      this.lastUser = storage.getLastAccess();
      this.creds.email = (this.lastUser != null) ? this.lastUser.email : '';

      // Inicializa o controle de sessão
      let sessaoFim : SessaoFinalizada = {
        show: false,
      }
      this.storage.setSessaoFinalizada(sessaoFim);
  }

  ionViewWillEnter() {
    this.menu.swipeEnable(false);
    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      this.verificar(this.auth);
    }
  }

  ionViewDidLeave() {
    this.menu.swipeEnable(true);
  }

  ionViewDidEnter() {
    this.toastCtrl.create({
      message: "Para o perfeito funcionamento do APP, verifique se a Internet e o GPS do seu dispositivo está ativado",
      duration: 1000,
      position: 'top'
    }).present();

    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      this.verificar(this.auth);
    }
  }

  verificar(auth){
    auth.refreshToken()
      .subscribe(response => {
        if ( this.auth ) {
          //aqui
          let autorizacao = response.headers.get('Authorization');
          if ( autorizacao != null ) {}
            this.auth.successfulLogin(autorizacao);
            this.navCtrl.setRoot('LeitorPage');
        }
      },
        error => {
          console.log("||| Erro");
         });
  }

  login() {
    this.creds.email = this.creds.email.trim(); // remove os espaços em branco a direita e a esquerda automaticamente
    this.auth.authenticate(this.creds)
      .subscribe(response => {
        this.auth.successfulLogin(response.headers.get('Authorization'));
        this.events.publish('user:loggedin');

        // Registra a auditoria de acesso do usuário

        // Recuperar o idCliente
        let idCliente : string;
        let localUser = this.storage.getLocalUser();
        if (localUser && localUser.email) {
          if (idCliente == null){
            idCliente = localUser.id;
          }
        }

        let ha : HistoricoAcessoDTO = {
          id : null,
          cliente : { id : idCliente },
          dtHoraHistorico : null,
          email : localUser.email 
        }
        this.historicoAcesso.insert(ha)
        .subscribe(response => {
          this.navCtrl.setRoot('LeitorPage');
        }, (err) => {
          console.log(">>> Erro 1: home.ts (" + err + ")");
        });
      }, (err) => { 
        console.log(">>> Erro 2: home.ts (" + err + ")"); // Sem conexão com o servidor -> ERR_CONNECTION_REFUSED
      });
  }

  signup() {
    this.navCtrl.push('SignupPage');
  }

  esqueciSenha(){
    this.navCtrl.push('ForgotPage');
  }

  sair(){
    this.platform.exitApp();
  }

  resetLocalStorage(){
    this.storage.setShowDicas(null);
    this.storage.setShowCad(null);
  }
}