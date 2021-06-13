import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import {
  ProductComponent
} from './product-component';

@NgModule({
  declarations: [
    ProductComponent,
  ],
  imports: [IonicModule],
  exports: [
    ProductComponent,
  ]
})
export class ProductComponentModule {}