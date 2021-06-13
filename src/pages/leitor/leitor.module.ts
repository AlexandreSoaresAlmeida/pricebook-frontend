import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeitorPage } from './leitor';

@NgModule({
  declarations: [
    LeitorPage,
  ],
  imports: [
    IonicPageModule.forChild(LeitorPage),
  ],
})
export class LeitorPageModule {}
