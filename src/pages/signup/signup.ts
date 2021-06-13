import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ClienteService } from './../../services/domain/cliente.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  formGroup: FormGroup;
  //cep : string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menu: MenuController,
    public formBuilder: FormBuilder,
    public clienteService : ClienteService,
    public alertCtrl : AlertController,
    public loadingCtrl: LoadingController,
    ) {

    this.formGroup = this.formBuilder.group({
        nome : ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
        email : ['', [Validators.required, Validators.email]],
        cep : [],
        senha : ['', [Validators.required]],
        confirmacao_senha : ['', [Validators.required]],
        aceite_termo_uso : [false, Validators.compose([CheckboxValidator.isChecked, Validators.required])],
      });
  }

  signupUser() {
    let loader = this.presentLoading();
    //this.formGroup.addControl("cep", new FormControl(''));
    //this.formGroup.controls["cep"].setValue(this.cep);

    // Setar o email se espaços em branco
    let email = this.formGroup.controls["email"].value + " ";
    email = email.trim();
    this.formGroup.controls.email.setValue(email);

    let senha  = this.formGroup.controls["senha"].value + " ";
    senha  = senha.trim(); // remove os espaços em branco a direita e a esquerda automaticamente
    this.formGroup.controls.senha.setValue(senha);

    let senhaConfirmacao = this.formGroup.controls["confirmacao_senha"].value + " ";
    senhaConfirmacao = senhaConfirmacao.trim();// remove os espaços em branco a direita e a esquerda automaticamente
    this.formGroup.controls.confirmacao_senha.setValue(senhaConfirmacao);

    if (senha != senhaConfirmacao) {
      let alert = this.alertCtrl.create({
        title: 'Senha Incompatíveis',
        message: "As senhas informadas são diferentes entre sí, informe corretamente!",
        //subTitle: error,
        buttons: [
      {
        text: "Ok",
        handler: data => {
          loader.dismiss();
        }
      }]
      });
      alert.present();
    } else {
      this.clienteService.insert(this.formGroup.value)
        .subscribe(response => {
          loader.dismiss();
          this.showInsertOK();
        },
        error => {
          console.log("Erro ao incluir novo consumidor!");
          loader.dismiss();
        });
      }
  }

  retornar(){
    this.navCtrl.push('HomePage');
  }

  showInsertOK() {
    let alert = this.alertCtrl.create({
      title: 'Sucesso!',
      message: 'Cadastro efetuado com sucesso',
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

import { FormControl } from '@angular/forms';
export class CheckboxValidator{
  static isChecked(control: FormControl) : any {
    if(control.value != true){
      return {
        "notChecked" : true
      };
    }
    return null;
  }
}  