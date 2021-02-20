import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prop',
})
export class PropPipe implements PipeTransform {
  transform(input: any[], key: string): any {
    return input.map((value) => value[key]);
  }
}
