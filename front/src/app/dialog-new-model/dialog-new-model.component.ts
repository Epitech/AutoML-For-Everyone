import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { configDict, ModelType, scoring_classification, scoring_regression } from '../../api2';

@Component({
  selector: 'app-dialog-new-model',
  templateUrl: './dialog-new-model.component.html',
  styleUrls: ['./dialog-new-model.component.css']
})
export class DialogNewModelComponent implements OnInit {

  configDictOptions = configDict;
  scoringOptions = this.data.scoring === "classification" ? scoring_classification : scoring_regression;

  isNegative = (v: number) => v <= 0;
  isNotRatio = (v: number) => v < 0 || v > 1;
  isTooMuch = (v1: number, v2:number) => v1 + v2 > 1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModelType,
    public dialog: MatDialog
  ) {
    this.scoringOptions = this.data.scoring === "classification" ? scoring_classification : scoring_regression;
    this.data.scoring = this.data.scoring === "classification" ? scoring_classification[0] : scoring_regression[0];
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

  ngOnInit(): void {
  }

  configure(key: string, input: EventTarget | null, isNumber = true) {
    if (!input) return;
    const { value } = input as HTMLInputElement;
    console.log(key);
    if (key === 'config_dict') {
      this.data.config_dict = value;
    } else if (key === 'scoring') {
        this.data.scoring = value;
    } else {
      this.data[key] = isNumber ? +value : value;
    }
  }

}
