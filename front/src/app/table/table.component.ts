import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';

import {
  DialogLintComponent,
  LintType,
} from '../dialog-lint/dialog-lint.component';

export type ColumnsType = { [key: string]: boolean };
export type EmittedType = {
  columns: ColumnsType;
  label?: string;
};
export type Lint = [string, string, boolean][];
export type Dispatch = (value: EmittedType) => void;
export type DataType = {
  dispatch?: Dispatch;
  lints?: { [key: string]: Lint };
  id?: string;
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

  lintContainsbad = (lints: Lint): ThemePalette =>
    lints.reduce((c, l) => c + +l[2], 0) ? 'warn' : 'accent';
}
