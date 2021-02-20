import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { LintType } from '../../api2';

export type DataType = {
  lints: LintType;
  column: string;
};

@Component({
  selector: 'app-dialog-lint',
  templateUrl: 'dialog-lint.html',
  styleUrls: ['dialog-lint.css'],
})
export class DialogContentLint {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DataType) {}

  openHelp = (link: string) => window.open(link);
}
