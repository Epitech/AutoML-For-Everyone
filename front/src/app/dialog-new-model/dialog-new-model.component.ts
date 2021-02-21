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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModelType,
    public dialog: MatDialog
  ) {
    this.scoringOptions = this.data.scoring === "classification" ? scoring_classification : scoring_regression;
    this.data.scoring = this.data.scoring === "classification" ? scoring_classification[0] : scoring_regression[0];
  }

  ngOnInit(): void {
  }

  configure(key: string, input: EventTarget | null, isNumber = true) {
    if (!input) return;
    const { value } = input as HTMLInputElement;
    console.log(key);
    if (key === 'config_dict') {
      this.data.config_dict = value;
    } else {
      this.data.key = isNumber ? +value : value;
    }
  }
}
