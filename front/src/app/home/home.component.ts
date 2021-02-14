import { Component } from '@angular/core';

type Selected = 'new' | 'cla' | 'reg' | 'clu' | 'tim';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  selected: Selected = 'new';
}
