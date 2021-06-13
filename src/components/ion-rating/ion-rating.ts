import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ion-rating',
  templateUrl: 'ion-rating.html'
})
export class IonRatingComponent {

  @Input() numStars: number = 5;
  @Input() value: number = 4;
  @Input() readOnly : boolean = false;

  @Output() ionClick: EventEmitter<number> = new EventEmitter<number>();

  stars : string[] = [];
	
	constructor() {}

	ngAfterViewInit(){
		this.calc();
	}
	
	calc(){
		this.stars = [];
		let tmp = this.value;
		for(let i=0; i < this.numStars; i++, tmp--){
			if(tmp >= 1)
				this.stars.push("star");
			else if(tmp > 0 && tmp < 1)
				this.stars.push("star-half");
			else this.stars.push("star-outline");
		}
	}
	
	starClicked(index){
		if(!this.readOnly){
			this.value = index + 1;
			this.ionClick.emit(this.value);
			this.calc();
		}
	}
}