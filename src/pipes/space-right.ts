import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceRight',
})
export class SpaceRightPipe implements PipeTransform {
  transform(value: string, limite: string): string {
    // debugger
    let limit = parseInt(limite);
    let space = '';
    for (let i = 0; i < limit; i++) { space += ' ';}
    return value.length > limit ? value.substring(0, limit) : (value + space).substring(0, limit);
  }
}
