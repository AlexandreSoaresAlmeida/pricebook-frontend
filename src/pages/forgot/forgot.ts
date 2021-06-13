import { StorageService } from './../../services/storage.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { API_CONFIG } from '../../config/api.config';
//import { Session } from '../../providers/session';

@IonicPage()
@Component({
  selector: 'page-forgot',
  templateUrl: 'forgot.html',
})
export class ForgotPage {
  formGroup: FormGroup;

  msgFooter: string = API_CONFIG.msgFooter;
    
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menu: MenuController,
    public formBuilder: FormBuilder,
    public authService : AuthService,
    public alertCtrl : AlertController,
    public loadingCtrl: LoadingController,
    public storage: StorageService,
//    private session : Session,
    ) {
    this.formGroup = this.formBuilder.group({
        email : ['', [Validators.required, Validators.email]],
      });
/*
    // Verifica sessão
    if (!this.session.verificarSessao()){
      this.navCtrl.setRoot('HomePage'); 
    }
          
    // Atualiza sessão
    this.atualizaSessao();
*/    
  }

/*  
  atualizaSessao() {
    //........................................................................
    // Atualiza o último acesso do usuário para o controle no tempo da sessão
    //........................................................................
    let hoje = new Date(Date.now());
    let ultimoAcesso : LastUser = <LastUser> this.storage.getLastAccess();
    ultimoAcesso.lastAccess = hoje;
    this.storage.setLastAccess(ultimoAcesso);
  }
*/  
  
  resetPassword() {
    let loader = this.presentLoading();
    let email : any = this.formGroup.controls["email"].value + " ";
    email = email.trim();
    if (email) {
      this.authService.forgot(email)
        .subscribe(response => {
          loader.dismiss();
          this.showResetPasswordOK();        
        },
        error => {
          console.log("Erro ao redefinir senha!");
          loader.dismiss();
        });
      } else {
        console.log("Erro ao redefinir senha!");
        loader.dismiss();
      }
  }

  retornar(){
    this.navCtrl.push('HomePage');
  }

  showResetPasswordOK() {
    let alert = this.alertCtrl.create({
      title: 'Sucesso!',
      message: 'Senha redefinida e enviada para o seu e-mail!',
      enableBackdropDismiss: false,
      buttons :[
        {
          text: 'OK',
          handler: () =>{
            this.navCtrl.setRoot('HomePage');
          }
        }
      ]
    });
    alert.present();
  }

  ionViewWillEnter() {
    this.menu.swipeEnable(false);
  }

  ionViewWillLeave() {
    this.menu.swipeEnable(true);
  } 

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Aguarde...",
    });
    loader.present();
    return loader;
  }
}