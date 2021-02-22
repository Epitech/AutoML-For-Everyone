import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  delete_model,
  get_config,
  post_model,
  ModelType,
  configDict,
} from '../../api2';

import { callbackType, createType } from '../docaposte-list/docaposte-list';
import { ProgressionDataService } from '../progression-data.service';
import { DialogNewModelComponent } from '../dialog-new-model/dialog-new-model';

@Component({
  selector: 'app-select-model',
  templateUrl: 'select-model.html',
  styleUrls: ['select-model.css'],
})
export class ConfigModelComponent {
  model_list?: [];
  config?: string;
  model?: string;
  model_type: string = 'classification';

  constructor(
    public progressionData: ProgressionDataService,
    public dialog: MatDialog
  ) {
    this.progressionData.getConfig().subscribe((c) => {
      this.config = c;
      this.updateList();
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

  select: callbackType = (model) => this.progressionData.setModel(model);

  remove: callbackType = (model) => {
    if (model === this.model) this.progressionData.setModel(undefined);
    delete_model(model).then(() => this.updateList());
  };

  create: createType = () => {
    const data: ModelType = {
      generations: 100,
      population_size: 100,
      offspring_size: 100,
      mutation_rate: 0.1,
      crossover_rate: 0.1,
      subsample: 1,
      early_stop: 100,
      scoring: this.model_type,
      config_dict: configDict[0],
    };
    this.dialog
      .open(DialogNewModelComponent, { data })
      .afterClosed()
      .subscribe((model) => {
        if (model) post_model(model, this.config).then(() => this.updateList());
      });
  };
}
