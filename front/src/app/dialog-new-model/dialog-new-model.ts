import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModelType } from 'src/api2';

export type ModelDataType = {
  dispatch: (m: ModelType) => void;
  model: ModelType;
};

@Component({
  selector: 'app-dialog-new-model',
  templateUrl: 'dialog-new-model.html',
  styleUrls: ['dialog-new-model.css'],
})
export class DialogNewModelComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ModelDataType) {}

  wrongGenerations = () => this.data.model.generations <= 0;

  changeGenerations(input: EventTarget | null) {
    if (!input) return;
    const { value } = input as HTMLInputElement;
    this.data.model.generations = +value;
    this.data.dispatch(this.data.model);
  }
}
