import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-aumento-abusivo',
  templateUrl: 'aumento-abusivo.html',
})
export class AumentoAbusivoPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AumentoAbusivoPage');
  }

}
