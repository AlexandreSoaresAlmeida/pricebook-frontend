import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { API_CONFIG } from '../../config/api.config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { CredenciaisDTO } from '../../models/credenciais.dto';
import { StorageService } from '../../services/storage.service';
import { LastUser } from '../../models/last_user';
import { Session } from '../../providers/session';

@IonicPage()
@Component({
  selector: 'page-changepsw',
  templateUrl: 'changepsw.html',
})
export class ChangepswPage {
  titleApp          : string;
  email             : string;
  senha             : string;
  novaSenha         : string;
  confirmaNovaSenha : string;

  formGroup: FormGroup;

  msgFooter: string = API_CONFIG.msgFooter;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public authService : AuthService,
    public alertCtrl : AlertController,
    public loadingCtrl: LoadingController,
    public storage: StorageService,
    private session : Session,
    ) {
      this.titleApp = `${API_CONFIG.titleApp}`;
      this.formGroup = this.formBuilder.group({
  //      senha             : ['', [Validators.required, Validators.minLength(6)]],
        novaSenha         : ['', [Validators.required, Validators.minLength(6)]],
        novaSenhaConfirmacao : ['', [Validators.required, Validators.minLength(6)]], 
      });
      let localUser = this.storage.getLocalUser();
      this.email = localUser.email;

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
    //console.log('ionViewDidLoad ChangepswPage');
  }

  registrarNovaSenha(){
    let loader = this.presentLoading();
    let senha  = this.formGroup.controls["novaSenha"].value + " ";
    let senhaConfirmacao = this.formGroup.controls["novaSenhaConfirmacao"].value + " ";
    senha  = senha.trim(); // remove os espaços em branco a direita e a esquerda automaticamente
    senhaConfirmacao = senhaConfirmacao.trim();// remove os espaços em branco a direita e a esquerda automaticamente
    if (senha != senhaConfirmacao) {
      let alert = this.alertCtrl.create({
        title: 'Senha Incompatíveis',
        message: "As senhas informadas são diferentes entre sí, informe corretamente!",
        //subTitle: error,
        buttons: [
      {
        text: "Ok",
        handler: data => {
          console.log("Ok Clicked")
        }
      }]
      });
      alert.present();
    } else {
      let creds: CredenciaisDTO = {
        "email" : this.email.trim(),
        "senha" : "", //this.formGroup.controls["senha"].value,
        "novaSenha" : senha,
        "novaSenhaConfirmacao" : senhaConfirmacao
      };
      this.authService.changePsw(creds)
      .subscribe(
        response => {
          loader.dismiss();
          this.showChangePasswordOK();
      }, (err) => {
        loader.dismiss();
        console.log(">>> Erro - Não foi possível alterar a senha do usuário!");
        let alert = this.alertCtrl.create({
          title: 'error',
          message: "Erro: Ocorreu falha ao tentar alterar a senha do usuário /n ("+err+")",
          //subTitle: error,
          buttons: [
        {
          text: "Ok",
          handler: data => {
            console.log("Ok Clicked")
          }
        }]
        });
        alert.present();
      });
    }
  }

  retornar(){
    this.navCtrl.setRoot('LeitorPage');
  }

  showChangePasswordOK() {
    let alert = this.alertCtrl.create({
      title: 'Sucesso!',
      message: 'Senha alterada e enviada para o seu e-mail!',
      enableBackdropDismiss: false,
      buttons :[
        {
          text: 'OK',
          handler: () =>{
            this.navCtrl.setRoot('LeitorPage');
          }
        }
      ]
    });
    alert.present();
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Aguarde...",
    });
    loader.present();
    return loader;
  }
}
