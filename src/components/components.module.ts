import { ProductComponentModule } from './product/product-component.module';
import { TimelineComponentModule } from './timeline/timeline.module';
import { IonicModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { AccordionListModule } from './accordion-list/accordion-list.module';
import { SanfonaComponentModule } from './sanfona/sanfona.module';
import { IonRatingComponent } from './ion-rating/ion-rating';
import { ChartsModule } from 'ng2-charts';
import { PipesModule } from '../pipes/pipes.module';

export const components = [
];

@NgModule({
  declarations: [
    components,
    IonRatingComponent,
  ],
  imports: [IonicModule],
  exports: [
	  components,    
    TimelineComponentModule,
    ProductComponentModule,
    AccordionListModule,
    SanfonaComponentModule,
    IonRatingComponent,
    ChartsModule,
    PipesModule,
  ]
})
export class ComponentsModule {}