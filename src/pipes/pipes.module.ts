import { NgModule } from '@angular/core';
import { TruncatePipe } from './truncate.pipe';
import { SpaceRightPipe } from './space-right';
import { SpaceLeftPipe } from './space-left';
import { PointLeftPipe } from './point-left';
import { CurrenyBRLPipe } from './currency-brl.pipe';

@NgModule({
	declarations: [
        TruncatePipe,
        SpaceRightPipe,
        SpaceLeftPipe,
        PointLeftPipe,
        CurrenyBRLPipe,
    ],
	imports: [],
	exports: [
        TruncatePipe,
        SpaceRightPipe,
        SpaceLeftPipe,
        PointLeftPipe,
        CurrenyBRLPipe,
    ]
})
export class PipesModule {}
