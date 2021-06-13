import { Pipe, PipeTransform } from '@angular/core';

//truncate('Bacon ipsum dolor amet sirloin tri-tip swine', 5, '…')
//> "Bacon ipsum dolor amet sirloin…"

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limite: string): string {
    let limit = parseInt(limite);
    let complete = ' ';
    for (let i = 1; i < limit+3; i++) {
      complete += '.';
    }
    return value.length > limit ? value.substring(0, limit) + "..." : (value + complete).substring(0, limit+3);
  }
}