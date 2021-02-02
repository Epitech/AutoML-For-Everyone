import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModelType, scoring } from 'src/api2';

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
  scoringOptions = scoring;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ModelDataType) {}

  isNegative = (v: number) => v <= 0;
  isNotRatio = (v: number) => v < 0 || v > 1;

  wrong = (): boolean =>
    this.isNegative(this.data.model!.generations) ||
    this.isNegative(this.data.model!.population_size) ||
    this.isNegative(this.data.model!.offspring_size) ||
    this.isNotRatio(this.data.model!.mutation_rate) ||
    this.isNotRatio(this.data.model!.crossover_rate) ||
    this.isNotRatio(this.data.model!.subsample) ||
    this.isNegative(this.data.model!.early_stop);

  changeKey(key: string, input: EventTarget | null) {
    if (!input) return;
    const { value } = input as HTMLInputElement;
    this.data.model[key] = +value;
    this.data.dispatch(this.data.model);
    console.log(this.data.model);
  }
}
