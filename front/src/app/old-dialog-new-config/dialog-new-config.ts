import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { post_lint } from 'src/api2';
import { DataType, Dispatch } from '../old-table/table.component';

@Component({
  selector: 'app-dialog-new-config',
  templateUrl: 'dialog-new-config.html',
  styleUrls: ['dialog-new-config.css'],
})
export class DialogContentNewConfig {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DataType) {
    if (!data.dispatch || !data.id) return;

    const endDispatch: Dispatch = data.dispatch;

    const mainDispatch: Dispatch = (value) => {
      endDispatch(value);

      if (!value.label) {
        data.lints = {};
        return;
      }

      post_lint(data.id!, value).then(({ lints }) => {
        data.lints = lints;
      });
    };

    data.dispatch = mainDispatch;
  }
}
