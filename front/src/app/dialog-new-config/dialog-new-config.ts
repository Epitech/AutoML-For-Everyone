import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export type DataType = {
  columns: string[];
};
type ColumnsType = { [key: string]: boolean };

type NewConfigType = {
  columns: ColumnsType;
  label?: string;
};

@Component({
  selector: 'app-dialog-new-config',
  templateUrl: 'dialog-new-config.html',
  styleUrls: ['dialog-new-config.css'],
})
export class DialogContentNewConfig {
  config: NewConfigType;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DataType) {
    this.config = {
      columns: data.columns.reduce(
        (obj: ColumnsType, col) => ({ ...obj, [col]: false }),
        {}
      ),
    };
  }

  changeLabel = (col: string, checked: boolean) => {
    this.config.label = checked ? col : undefined;
  };
}
