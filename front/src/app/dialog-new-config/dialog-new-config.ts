import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';

import {
  NewConfigType as ApiNewConfigType,
  post_lint,
  LintType,
  ColumnLintType,
  PostLintType,
} from '../../api2';

import {
  DialogContentLint,
  DataType as LinterDataType,
} from '../dialog-lint/dialog-lint';

export type DataType = {
  dataset: string;
  columns: string[];
};

type ColumnsType = { [key: string]: boolean };
type NewConfigType = Omit<ApiNewConfigType, 'label'> & {
  label?: string;
};

@Component({
  selector: 'app-dialog-new-config',
  templateUrl: 'dialog-new-config.html',
  styleUrls: ['dialog-new-config.css'],
})
export class DialogContentNewConfig {
  config: NewConfigType;
  dataset: string;
  lints: ColumnLintType = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DataType,
    public dialog: MatDialog
  ) {
    this.dataset = data.dataset;
    this.config = {
      model_type: 'classification',
      columns: data.columns.reduce(
        (obj: ColumnsType, col) => ({ ...obj, [col]: false }),
        {}
      ),
    };
  }

  refreshLints = () => {
    if (this.config.label)
      post_lint(this.dataset, this.config)
        .then(({ lints }: PostLintType) => {
          this.lints = lints;
        })
        .catch(() => {
          this.lints = {};
        });
    else this.lints = {};
  };

  lintColor = (lints: LintType): ThemePalette =>
    lints.reduce((c, l) => c + +l[2], 0) ? 'warn' : 'accent';

  openLints(column: string) {
    const data: LinterDataType = { column, lints: this.lints[column] };
    this.dialog.open(DialogContentLint, { data });
  }

  changeColumn = (column: string, checked: boolean) => {
    this.config.columns[column] = checked;
    this.refreshLints();
  };

  changeLabel = (col: string, checked: boolean) => {
    this.config.label = checked ? col : undefined;
    this.refreshLints();
  };
}
