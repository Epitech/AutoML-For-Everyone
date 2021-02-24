import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  configDict,
  configDictDefault,
  ModelConfig,
  scoring_classification,
  scoring_regression,
} from '../../api';

@Component({
  selector: 'app-dialog-new-model',
  templateUrl: 'dialog-new-model.html',
  styleUrls: ['dialog-new-model.css'],
})
export class DialogNewModelComponent {
  configDictOptions = configDict;
  scoringOptions =
    this.data.scoring === 'classification'
      ? scoring_classification
      : scoring_regression;

  isNegative = (v: number) => v <= 0;
  isNotRatio = (v: number) => v < 0 || v > 1;
  isTooMuch = (v1: number, v2: number) => v1 + v2 > 1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModelConfig,
    public dialog: MatDialog
  ) {
    this.scoringOptions =
      this.data.scoring === 'classification'
        ? scoring_classification
        : scoring_regression;
    this.data.scoring =
      this.data.scoring === 'classification'
        ? scoring_classification[0]
        : scoring_regression[0];
  }

  wrong = (): boolean =>
    this.isNegative(this.data.generations) ||
    this.isNegative(this.data.population_size) ||
    this.isNegative(this.data.offspring_size) ||
    this.isNotRatio(this.data.mutation_rate) ||
    this.isNotRatio(this.data.crossover_rate) ||
    this.isNotRatio(this.data.subsample) ||
    this.isNegative(this.data.early_stop) ||
    this.isTooMuch(this.data.crossover_rate, this.data.mutation_rate);

  configure(key: string, input: EventTarget | null) {
    if (!input) return;
    const { value } = input as HTMLInputElement;
    (this as any).data[key] = +value;
  }

  configureConfigDict(value: string) {
    if (value === configDictDefault) {
      this.data.config_dict = undefined;
    } else {
      this.data.config_dict = value;
    }
  }

  configureScoring(value: string) {
    this.data.scoring = value;
  }
}
