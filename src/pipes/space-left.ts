import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceLeft',
})
export class SpaceLeftPipe implements PipeTransform {
  transform(value: string, limite: string): string {
    let limit = parseInt(limite);
    let space = '';
    for (let i = 0; i < limit; i++) { space += ' '}
   // debugger
    let textComplete = space + value;
   // console.log(">>>> texto: " + textComplete.substring(limit, textComplete.length));
    return value.length > limit ? value : textComplete.substring(textComplete.length-limit, textComplete.length);
  }
}
