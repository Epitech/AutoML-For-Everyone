import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { callbackType, createType } from '../docaposte-list/docaposte-list';

import { delete_model, get_config } from '../../api2';

import { ProgressionDataService } from '../progression-data.service';
import {
  DialogNewModelComponent,
} from '../dialog-new-model/dialog-new-model.component';

@Component({
  selector: 'app-config-model',
  templateUrl: './config-model.component.html',
  styleUrls: ['./config-model.component.css']
})
export class ConfigModelComponent implements OnInit {
  model_list = [];
  config?: string;


  constructor(public progressionData: ProgressionDataService,
    public dialog: MatDialog) {
      this.progressionData.getConfig().subscribe({
        next: (c) => {
          this.config = c;
          this.updateList();
        },
      });
    }

  updateList() {
    get_config(this.config).then((response) => {
      console.log(response['models']);
      this.model_list = response['models']
    });
  }

  ngOnInit(): void {

  }

  select: callbackType = (model) => {
    this.progressionData.setModel(model);
  };

  remove: callbackType = (config) => {
    delete_model(config).then(() => {
      get_config(this.config).then((response) => {
        console.log(response['models']);
        this.model_list = response['models']
      });
    });
  };

  create: createType = () => {
    this.dialog
      .open(DialogNewModelComponent)
  };

}
