import { Component, EventEmitter, Input, Output } from '@angular/core';

type Fields = { [key: string]: boolean };
type Label = string | undefined;
export type EmittedType = {
  columns: Fields;
  label: Label;
};
export type DataType = {
  dispatch?: (value: EmittedType) => void;
} & EmittedType;

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent {
  @Output() changeEvent = new EventEmitter<EmittedType>();
  @Input() transit!: DataType;

  handleCheck(col: string, checked: boolean) {
    if (!this.transit.dispatch) return;

    this.transit.columns[col] = checked;
    if (col === this.transit.label && !checked) this.transit.label = undefined;
    this.transit.dispatch(this.transit);
  }

  changeLabel(label: string) {
    if (!this.transit.dispatch) return;

    this.transit.label = this.transit.label === label ? undefined : label;
    this.transit.dispatch(this.transit);
  }
}
