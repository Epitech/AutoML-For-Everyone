import { Component } from '@angular/core';

type Selected = 'new' | 'cla' | 'reg' | 'clu' | 'tim';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.html',
  styleUrls: ['./stepper.css'],
})
export class HomeComponent {
  selected: Selected = 'new';
}
