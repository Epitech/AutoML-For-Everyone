import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export type PredictType = { [key: string]: string | undefined };

export type PredictData = {
  predictColumns: PredictType;
  dispatch: (column: string, value: string) => void;
};

@Component({
  selector: 'app-dialog-predict',
  templateUrl: 'dialog-predict.html',
  styleUrls: ['dialog-predict.css'],
})
export class DialogPredictComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: PredictData) {}

  handleChange(column: string, input: EventTarget | null) {
    if (!input) return;
    const { value } = input as HTMLInputElement;

    this.data.predictColumns[column] = value;
    this.data.dispatch(column, value);
  }

  anyWrong = () =>
    Object.values(this.data.predictColumns).some((v) => v === '');
}
