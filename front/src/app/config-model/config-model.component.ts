import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { callbackType, createType } from '../docaposte-list/docaposte-list';

import { delete_model, get_config, post_model, ModelType, scoring_classification, scoring_regression, configDict } from '../../api2';

import { ProgressionDataService } from '../progression-data.service';
import { DialogNewModelComponent } from '../dialog-new-model/dialog-new-model.component';

@Component({
  selector: 'app-config-model',
  templateUrl: './config-model.component.html',
  styleUrls: ['./config-model.component.css'],
})
export class ConfigModelComponent implements OnInit {
  model_list?: [];
  config?: string;
  model?: string;
  model_type: string = "classification";


  constructor(
    public progressionData: ProgressionDataService,
    public dialog: MatDialog
  ) {
    this.progressionData.getConfig().subscribe({
      next: (c) => {
        this.config = c;
        this.updateList();
      },
    });
    this.progressionData.getModel().subscribe((m) => {
      this.model = m;
    });
  }

  updateList() {
    if (this.config)
      get_config(this.config).then((response) => {
        this.model_list = response['models'];
        this.model_type = response['model_type'];
      });
    else this.model_list = undefined;
  }

  ngOnInit(): void {}

  select: callbackType = (model) => {
    this.progressionData.setModel(model);
  };

  remove: callbackType = (model) => {
    if (model === this.model) this.progressionData.setModel(undefined);
    delete_model(model).then(() => this.updateList());
  };

  create: createType = () => {
    const data: ModelType = {
      generations: 100,
      population_size: 100,
      offspring_size: 100,
      mutation_rate: 1,
      crossover_rate: 1,
      subsample: 1,
      early_stop: 100,
      scoring: this.model_type,
      config_dict: configDict[0]
    };
    this.dialog
      .open(DialogNewModelComponent, { data })
      .afterClosed()
      .subscribe((model) => {
        if (model)
          post_model(model, this.config).then(() => {
            this.updateList();
          });
      });
  };
}
