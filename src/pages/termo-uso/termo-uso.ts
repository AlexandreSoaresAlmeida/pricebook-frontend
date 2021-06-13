import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { API_CONFIG } from './../../config/api.config';

@IonicPage()
@Component({
  selector: 'page-termo-uso',
  templateUrl: 'termo-uso.html',
})
export class TermoUsoPage {
  msgFooter: string = API_CONFIG.msgFooter;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    ) {}

}