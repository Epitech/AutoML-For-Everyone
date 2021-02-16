import { Component } from '@angular/core';

type Selected = 'new' | 'cla' | 'reg' | 'clu' | 'tim';

@Component({
  selector: 'app-new-project',
  templateUrl: 'new-project.html',
  styleUrls: ['new-project.css'],
})
export class NewProjectComponent {
  selected: Selected = 'new';
}
