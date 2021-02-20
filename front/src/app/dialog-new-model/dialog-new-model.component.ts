import { Component, OnInit } from '@angular/core';

import { configDict, scoring_classification, scoring_regression } from '../../api2';

@Component({
  selector: 'app-dialog-new-model',
  templateUrl: './dialog-new-model.component.html',
  styleUrls: ['./dialog-new-model.component.css']
})
export class DialogNewModelComponent implements OnInit {

  configDictOptions = configDict;
  scoringOptions = true == true ? scoring_classification : scoring_regression;

  constructor() { }

  ngOnInit(): void {
  }

}
