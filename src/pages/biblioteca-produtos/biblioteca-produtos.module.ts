import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BibliotecaProdutosPage } from './biblioteca-produtos';

@NgModule({
  declarations: [
    BibliotecaProdutosPage,
  ],
  imports: [
    IonicPageModule.forChild(BibliotecaProdutosPage),
  ],
})
export class BibliotecaProdutosPageModule {}
