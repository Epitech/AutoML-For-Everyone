import { Component, OnInit } from '@angular/core';
import { configDict, scoring_classification, scoring_regression } from '../../api2';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Food {
  value: string;
  viewValue: string;
}

// export type ModelDataType = {
//   dispatch: (m: ModelType) => void;
//   model: ModelType;
//   type: any;
// };

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

  constructor() { }

  ngOnInit(): void {
  }

  // changeKey(key: string, input: EventTarget | null, isNumber = true) {
  //   if (!input) return;
  //   const { value } = input as HTMLInputElement;
  //   if (key === 'config_dict') {
  //     this.setConfigDict(value);
  //   } else {
  //     this.data.model[key] = isNumber ? +value : value;
  //   }
  //   this.data.dispatch(this.data.model);
  //   console.log(this.data.model);
  // }

  // setConfigDict(value: string) {
  //   if (value === 'Default') {
  //     this.data.model.config_dict = undefined;
  //   } else {
  //     this.data.model.config_dict = value;
  //   }
  // }

}
