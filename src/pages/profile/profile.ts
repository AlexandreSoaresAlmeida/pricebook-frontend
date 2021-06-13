import { DashboardService } from './../../services/domain/dashboard.service';
import { API_CONFIG } from './../../config/api.config';
import { ClienteService } from './../../services/domain/cliente.service';
import { ClienteDTO } from './../../models/cliente.dto';
import { StorageService } from './../../services/storage.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Camera, CameraOptions} from '@ionic-native/camera';
import { LastUser } from '../../models/last_user';
import { Session } from '../../providers/session';
import { CategoriaClienteVipDTO } from '../../models/dashboard/categoria.cliente.vip.dto';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  cliente: ClienteDTO;
  picture : string;
  cameraOn: boolean = false;

  msgFooter: string = API_CONFIG.msgFooter;
  
  private items: CategoriaClienteVipDTO[]= [];
  public pontosUsuario : CategoriaClienteVipDTO;
  public icoEstrela : string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: StorageService,
    public clienteService: ClienteService,
    public camera : Camera,
    public events : Events,
    private session : Session,
    private dashboardService : DashboardService,
    ) {

      // Verifica sessão
      if (!this.session.verificarSessao()){
        this.navCtrl.setRoot('HomePage'); 
      }

      // Atualiza sessão
      this.atualizaSessao();
  }

  atualizaSessao() {
    //........................................................................
    // Atualiza o último acesso do usuário para o controle no tempo da sessão
    //........................................................................
    let hoje = new Date(Date.now());
    let ultimoAcesso : LastUser = <LastUser> this.storage.getLastAccess();
    ultimoAcesso.lastAccess = hoje;
    this.storage.setLastAccess(ultimoAcesso);
  }

  ionViewDidLoad() {
    this.loadData();
  }

  loadData(){
    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      this.clienteService.findByEmail(localUser.email)
        .subscribe(response => {
          this.cliente = response as ClienteDTO;
          this.getImageIfExists();
          this.carregarPontos();
        },
          error => {
            if (error.status == 403) {
              this.navCtrl.setRoot('HomePage');
            }
          });
    }
    else {
      this.navCtrl.setRoot('HomePage');
    }
  }

  public getImageIfExists() {
    this.clienteService.getImageFromBucket(this.cliente.id)
      .subscribe(response => {
        this.cliente.imageUrl = `${API_CONFIG.bucketBaseUrl}/consumidores/cons${this.cliente.id}.png`;
        console.log(">> foto: "+this.cliente.imageUrl);
      },
        error => { });
  }

  getCameraPicture() {
    this.cameraOn = true;

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      correctOrientation: true,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
     // debugger;
      this.picture = 'data:image/png;base64,' + imageData;
      this.cameraOn = false;
    }, (err) => {
      this.cameraOn = false;
    });
  }

  sendPicture() {
    this.clienteService.uploadPicture(this.picture)
      .subscribe(response => {
        this.picture = null;
        this.loadData();
        this.events.publish('user:loggedin');
      },
      error => {
      });
  }

  cancel() {
    this.picture = null;
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

}