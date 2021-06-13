import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShowProduto2Page } from './show-produto2';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
  declarations: [
    ShowProduto2Page,
  ],
  imports: [
    IonicPageModule.forChild(ShowProduto2Page),
    CurrencyMaskModule,
  ],
})
export class ShowProduto2PageModule {}
