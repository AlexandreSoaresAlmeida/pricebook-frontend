import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides } from 'ionic-angular';
import { API_CONFIG } from '../../config/api.config';
import { StorageService } from '../../services/storage.service';
import { ShowCad } from '../../models/show_cadastro';

@IonicPage()
@Component({
  selector: 'page-dicas',
  templateUrl: 'dicas.html',
})
export class DicasPage {
  imgPath  : String = `${API_CONFIG.imgPath}`;
  titleApp : String = `${API_CONFIG.titleApp}`;

  @ViewChild('slider') slider: Slides;
  slideIndex = 0;
  slides = [
    /*
    {
      title: '',
      icoUrl: this.imgPath + '/dicas/so_logo.png',
      imageUrl: this.imgPath + '/dicas/compras.png',
      description: '<h1>Uma ferramenta de empoderamento do consumidor</h1>',
    },
    */
    {
      title: '',
      icoUrl: '', //this.imgPath + '/dicas/beneficios.png',
      imageUrl: this.imgPath + '/dicas/compras.png',
      description: 'Com esse APP, você acompanha o histórico de preços dos produtos, facilitando a sua tomada de decisão de compra.',
    },
    {
      title: 'Como utilizar?',
      icoUrl: this.imgPath + '/dicas/uso.png',
      imageUrl: this.imgPath + '/dicas/compras.png',
      description: '<h1>Simples!!</h1> <br><br> Posicione a câmera do celular no código de barras do produto, cadastre o preço atual e confirme sua consulta.',
    },
    {
      title: '',
      icoUrl: '', //this.imgPath + '/dicas/objetivo.png',
      imageUrl: this.imgPath + '/dicas/compras.png',
      description: '<span style="position: absolute; top:30px;">E o melhor, você define quais produtos devem ser cadastrados. <br><br> Tudo de acordo com seu perfil de consumo.</span>',
    },
    /*
    {
      title: '',
      icoUrl: '', //this.imgPath + '/dicas/beneficios.png',
      imageUrl: this.imgPath + '/dicas/compras.png',
      description: 'Além disso, em casos de percepção de aumento abusivo de preços, o APP disponibiliza um canal de acesso para reclamações. <br><br><br><br> Tudo registrado no seu Pricebook!',
    },
    */
    {
      title: '',
      icoUrl: this.imgPath + '/dicas/so_logo.png',
      imageUrl: '', //this.imgPath + '/dicas/principal.png',
      description: '<span class="blink">Para o primeiro acesso é necessário criar uma conta no APP.</span>',
    }
  ];

  constructor(
    public navCtrl: NavController,
    public storage: StorageService,
    ) {}

  onSlideChanged() {
    this.slideIndex = this.slider.getActiveIndex();
    //console.log('Slide changed! Current index is', this.slideIndex);
  }

  goToApp() {
    this.saltarPag();
  }

  skip() {
    this.saltarPag();
  }

  saltarPag() {
    let localUser = this.storage.getLocalUser();
    let localCad = this.storage.getShowCad();
    //console.log("2>> dicas > Método:this.storage.getLocalUser: " + localUser);

    if (localUser && localUser.email) {
      this.navCtrl.setRoot('LeitorPage');
    } else {
      if (localCad == null) {
        // Injeta o controle do acesso a tela de cadastro
        let showCad: ShowCad = {
          show: true
        }
        this.storage.setShowDicas(showCad);
        this.navCtrl.setRoot('SignupPage');
      } else {
        this.navCtrl.setRoot('HomePage');
      }
    }
  }

  slideNext(){
    this.slider.slideNext();
  }

  slidePrev(){
    this.slider.slidePrev();
  }

  getShowDicas() : any {
    return (this.storage.getShowDicas() != null);
  }

}
