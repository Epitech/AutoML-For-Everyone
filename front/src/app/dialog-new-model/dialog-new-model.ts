import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { configDict, ModelType, scoring } from 'src/api2';

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
  configDictOptions = configDict;

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

  changeKey(key: string, input: EventTarget | null, isNumber = true) {
    if (!input) return;
    const { value } = input as HTMLInputElement;
    if (key === 'config_dict') {
      this.setConfigDict(value);
    } else {
      this.data.model[key] = isNumber ? +value : value;
    }
    this.data.dispatch(this.data.model);
    console.log(this.data.model);
  }

  setConfigDict(value: string) {
    if (value === 'Default') {
      this.data.model.config_dict = undefined;
    } else {
      this.data.model.config_dict = value;
    }
  }
}
