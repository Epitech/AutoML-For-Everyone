import { Component, OnInit } from '@angular/core';
import { configDict, scoring_classification, scoring_regression } from '../../api2';
import { MatDialog } from '@angular/material/dialog';
import { callbackType, createType } from '../docaposte-list/docaposte-list';

interface Food {
  value: string;
  viewValue: string;
}

import {
  DialogNewModelComponent,
} from '../dialog-new-model/dialog-new-model.component';

@Component({
  selector: 'app-config-model',
  templateUrl: './config-model.component.html',
  styleUrls: ['./config-model.component.css']
})
export class ConfigModelComponent implements OnInit {
  configDictOptions = configDict;
  scoringOptions = true == true ? scoring_classification : scoring_regression;
  
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  select: callbackType = (config) => {
    
  };

  remove: callbackType = (config) => {
    
  };

  create: createType = () => {
    this.dialog
      .open(DialogNewModelComponent)
  };

}
