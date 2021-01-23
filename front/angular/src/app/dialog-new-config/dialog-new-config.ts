import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataType } from '../table/table.component';

@Component({
  selector: 'app-dialog-new-config',
  templateUrl: 'dialog-new-config.html',
  styleUrls: ['dialog-new-config.css'],
})
export class DialogContentNewConfig {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DataType) {}
}
