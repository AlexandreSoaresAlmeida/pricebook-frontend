import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShowProduto1Page } from './show-produto1';
import { PipesModule } from '../../pipes/pipes.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';
//import { MoneyMaskModule } from 'ng2-money-mask';
//import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    ShowProduto1Page,
  ],
  imports: [
    IonicPageModule.forChild(ShowProduto1Page),
   // BrMaskerModule,
  //  MoneyMaskModule,
    CurrencyMaskModule,
    PipesModule,
  ],
})
export class ShowProduto1PageModule {}
