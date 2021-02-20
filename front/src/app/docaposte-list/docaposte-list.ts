import { Component, Input } from '@angular/core';

export type callbackType = (item: string) => void;
export type createType = () => void;

@Component({
  selector: 'app-docaposte-list',
  templateUrl: 'docaposte-list.html',
  styleUrls: ['docaposte-list.css'],
})
export class DocaposteListComponent {
  @Input() list?: string[];

  @Input() createTitle!: string;
  @Input() createText!: string;
  @Input() createButton!: string;
  @Input() createIcon!: string;
  @Input() create!: createType;

  @Input() selectTitle!: string;
  @Input() select!: callbackType;

  @Input() size!: string;

  @Input() remove!: callbackType;
}
