import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { AccordionListComponent } from './accordion-list';

@NgModule({
  declarations: [
    AccordionListComponent,
  ],
  imports: [IonicModule],
  exports: [
    AccordionListComponent,
  ]
})
export class AccordionListModule {}