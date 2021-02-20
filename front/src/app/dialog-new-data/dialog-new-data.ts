import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-new-data',
  templateUrl: 'dialog-new-data.html',
  styleUrls: ['dialog-new-data.css'],
})
export class DialogContentNewData {
  file?: File;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target?.files) return;
    this.file = target.files[0];
  }
}
