import { AuthService } from './../services/auth.service';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StorageService } from '../services/storage.service';
import { ClienteService } from '../services/domain/cliente.service';
import { ClienteDTO } from '../models/cliente.dto';
import { API_CONFIG } from '../config/api.config';
import { Events } from 'ionic-angular';
import { SettingsProvider } from '../providers/settings/settings';
import { ShowDicas } from '../models/show_dicas';
//import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { OneSignal, OSNotificationPayload } from '@ionic-native/onesignal';
import { oneSignalAppId, sender_id } from '../config';
import { versionNumber } from '../version';
import { DashboardService } from '../services/domain/dashboard.service';
import { CategoriaClienteVipDTO } from '../models/dashboard/categoria.cliente.vip.dto';

@Component({
  selector: 'myapp',
  templateUrl: 'app.html'
})
export class MyApp {
  cliente: ClienteDTO;
  @ViewChild(Nav) nav : Nav;
  rootPage: string = 'DicasPage'; // 'LeitorPage'; 
  pages: Array<{ title: string, component: string, icon: string, ativo:any }>;
  selectedTheme: String;
  materialDesignUser: string;
  perfilMandatory: string;
  basepath : string = "/pb";
  url : string;
  app_version_local : string = versionNumber;

  private items: CategoriaClienteVipDTO[]= [];
  public pontosUsuario : CategoriaClienteVipDTO;
  public icoEstrela : string = "";

  IMG_ENCONTRADA    : number = 1;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public auth: AuthService,
    public storage: StorageService,
    public clienteService: ClienteService,
    public events: Events,
    private settings: SettingsProvider,
//    private screenOrientation: ScreenOrientation,
    public oneSignal : OneSignal,
    private dashboardService : DashboardService,
  ) {
    this.settings.getActiveTheme().subscribe(val => this.selectedTheme = val);
    this.initializeApp();

    events.subscribe('user:loggedin', () => {
      this.carregaUsuario();
    });

    events.subscribe('user:loggeout', () => {
      this.pages = [];
    });

    this.basepath = "/api";
    if(this.platform.is("cordova")){
      this.basepath = `${API_CONFIG.bucketBaseUrl}`;
    }
    this.url = `${this.basepath}/consumidores`;

    //console.log("### this.storage.getShowDicas() -> "+this.storage.getShowDicas());

    if (!this.storage.getShowDicas()) {
      //console.log("*** (1)");
      // Seta a primeira visualização do ShowDicas
      let showDicas: ShowDicas = {
        show: true
      }
      this.storage.setShowDicas(showDicas);
      this.rootPage = 'DicasPage'; 
    } else {
      //console.log("*** (2)");
      // Seta o rootPage diretamente para o leitor de produtos
      // caso o usuário já esteja logado, caso contrário envia
      // para a tela de login
      let localUser = this.storage.getLocalUser();
      if (localUser && localUser.email) {
        this.rootPage = 'LeitorPage';          
      } else {
        this.rootPage = 'HomePage'; 
      }  
    }
  }

  carregaMenu() {
    //console.log(">>> Perfil: "+this.perfilMandatory);
    if (this.perfilMandatory == "ADMIN") {
      this.pages = [
//        { title: 'Aumento Abusivo', component: 'AumentoAbusivoPage', icon: 'md-hand', ativo: 1 },
        { title: 'DashBoard', component: 'DashboardPage', icon: 'podium', ativo: 1 },
        { title: 'Consultar Produto', component: 'LeitorPage', icon: 'barcode', ativo: 1 },
        { title: 'Meus Dados', component: 'ProfilePage', icon: 'contact', ativo: 1 },
        { title: 'Dicas', component: 'DicasPage', icon: 'logo-buffer', ativo: 1 },
        { title: 'Biblioteca de Produtos', component: 'BibliotecaProdutosPage', icon: 'ios-list-box-outline', ativo: 1 },
        { title: 'Alterar Senha', component: 'ChangepswPage', icon: 'md-swap', ativo: 1 },
        { title: 'Termo de Serviço', component: 'TermoUsoPage', icon: 'md-paper', ativo: 1 },
        { title: 'Sair do Aplicativo', component: 'HomePage', icon: 'exit', ativo: 1 },
      ];
    } else { // PERFIL CLIENTE
      this.pages = [
        { title: 'Consultar Produto', component: 'LeitorPage', icon: 'barcode', ativo: 1 },
        { title: 'Meus Dados', component: 'ProfilePage', icon: 'contact', ativo: 1 },
        { title: 'Dicas', component: 'DicasPage', icon: 'logo-buffer', ativo: 1 },
        { title: 'Biblioteca de Produtos', component: 'BibliotecaProdutosPage', icon: 'ios-list-box-outline', ativo: 1 },
        { title: 'Alterar Senha', component: 'ChangepswPage', icon: 'md-swap', ativo: 1 },
        { title: 'Termo de Serviço', component: 'TermoUsoPage', icon: 'md-paper', ativo: 1 },
        { title: 'Sair do Aplicativo', component: 'HomePage', icon: 'exit', ativo: 1 },
      ];
    }
  }

  private onPushReceived(payload: OSNotificationPayload) {
		alert(payload.body);
	}

	private onPushOpened(payload: OSNotificationPayload) {
		alert(payload.body);
	}

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.carregaUsuario();
      this.carregaMenu();

      // Configurações OneSignal para tratamento de mensagens via Push
      if (this.platform.is("cordova")) {
          this.oneSignal.startInit(oneSignalAppId, sender_id);

          // S e o perfil for "ADMIN" setar a tag PRICEBOOK_ADMIN
          if (this.perfilMandatory == "ADMIN") {
            this.oneSignal.sendTag("PRICEBOOK_ADMIN", "true");
          }

          this.oneSignal.
            inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
          this.oneSignal.handleNotificationReceived().
            subscribe(data => this.onPushReceived(data.payload));
          this.oneSignal.handleNotificationOpened().
            subscribe(data => this.onPushOpened(data.notification.payload));
          this.oneSignal.endInit();

//          (this.platform.is("cordova")) ? this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT) : '';
      }
    });
  }

  carregarPontos() {
    let id : number = Number(this.cliente.id);
    this.dashboardService.pontuacaoUsuario(id)
    .subscribe(response => {
      this.items = response;
      this.pontosUsuario = this.items[0]  as CategoriaClienteVipDTO;

      if (this.pontosUsuario.classificacao == 'Bronze') {
        this.icoEstrela = '#7B2E00';
      } else 
        if (this.pontosUsuario.classificacao == 'Silver') {
          this.icoEstrela = '#737373';
        }   
        else 
          if (this.pontosUsuario.classificacao == 'Gold')  {
            this.icoEstrela = '#FDB913';
          } 
          else 
            if (this.pontosUsuario.classificacao == 'Platinum') {
              this.icoEstrela = '#FFFFFF';
            }  
            else if (this.pontosUsuario.classificacao == 'Emerald') {
              this.icoEstrela = '#197B30';
            }  
    }, (err) => {
      console.log(">>> Erro ao recuperar pontuação do usuário.");
    });
  }

  openPage(page: { title: string, component: string }) {
    switch (page.title) {
       case 'Sair do Aplicativo':
        this.auth.logout();
        this.events.publish('user:loggedout');
        this.nav.setRoot('HomePage');
        this.platform.exitApp(); 
        break;
      default:
        this.nav.push(page.component);
        break;
    }
  }

  carregaUsuario() {
    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      this.clienteService.findByEmail(localUser.email)
        .subscribe(response => {
          this.cliente = response as ClienteDTO;
          this.getImageIfExists();
          this.perfilMandatory = this.getPerfil(this.cliente);
          this.carregarPontos();
          this.carregaMenu();
        },
          error => { });
    }
  }

  getImageIfExists() {

//    this.clienteService.getImageFromBucket(this.cliente.id)
//      .subscribe(response => {
        ((this.cliente.situacaoImagem == this.IMG_ENCONTRADA)) ? this.cliente.imageUrl = this.url + "/cons" + this.cliente.id + ".png" : this.cliente.imageUrl = "assets/imgs/pricebook/avatar-orange.png";

//      },
//        error => {
//          this.cliente.imageUrl = "assets/imgs/pricebook/avatar-orange.png";
//          console.log(">>> Erro ao recuperar a imagem do consumidor!!!");
//         });
  }

  getPerfil(cliente: ClienteDTO): string {
    let per = "CLIENTE";
    for (var i = 0; i < cliente.perfis.length; i++) {
      let p: any = cliente.perfis[i];
      if (p == "ADMIN") {
        per = p;
        break;
      } else 
      if (p == "ENTREGADOR") {
        per = p;
        break;
      } 
    }
    return per;
  }
}