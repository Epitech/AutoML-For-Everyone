import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lint } from '../table/table.component';

export type LintType = {
  lint: Lint;
  column: string;
};

@Component({
  selector: 'app-dialog-lint',
  templateUrl: 'dialog-lint.component.html',
  styleUrls: ['dialog-lint.component.css'],
})
export class DialogLintComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: LintType) {}

  openHelp = (link: string) => window.open(link);
}
