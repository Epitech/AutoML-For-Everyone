import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  DialogLintComponent,
  LintType,
} from '../dialog-lint/dialog-lint.component';

type Fields = { [key: string]: boolean };
type Label = string | undefined;
export type EmittedType = {
  columns: Fields;
  label: Label;
};
export type Lint = [string, string, boolean][];
export type DataType = {
  dispatch?: (value: EmittedType) => void;
  lints?: { [key: string]: Lint };
} & EmittedType;

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent {
  @Output() changeEvent = new EventEmitter<EmittedType>();
  @Input() transit!: DataType;

  constructor(public dialog: MatDialog) {}

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

  openLints(column: string) {
    const data: LintType = { lint: this.transit.lints![column], column };
    this.dialog.open(DialogLintComponent, { data });
  }
}
