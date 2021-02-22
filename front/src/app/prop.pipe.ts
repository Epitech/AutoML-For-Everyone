import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prop',
})
export class PropPipe implements PipeTransform {
  transform = (input: any[], key: string) => input.map((value) => value[key]);
}
