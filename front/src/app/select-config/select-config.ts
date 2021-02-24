import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  get_dataset,
  DatasetType,
  post_config,
  delete_config,
  get_config,
} from '../../api';

import {
  DialogContentNewConfig,
  DataType,
} from '../dialog-new-config/dialog-new-config';
import { ProgressionDataService } from '../progression-data.service';
import { callbackType, createType } from '../docaposte-list/docaposte-list';

@Component({
  selector: 'app-select-config',
  templateUrl: 'select-config.html',
  styleUrls: ['select-config.css'],
})
export class SelectConfigComponent {
  dataset?: DatasetType;
  config?: string;
  configNames?: string[];

  constructor(
    public progressionData: ProgressionDataService,
    public dialog: MatDialog
  ) {
    this.progressionData.getDataset().subscribe((id) => this.updateData(id));
    this.progressionData.getConfig().subscribe((c) => {
      this.config = c;
    });
  }

  updateData(datasetId?: string): void {
    if (datasetId)
      get_dataset(datasetId).then((dataset) => {
        this.dataset = dataset;
        Promise.all(
          dataset.configs.map((id) =>
            get_config(id).then(
              (config) => `Predicting ${config.label} with ${config.model_type}`
            )
          )
        ).then((names) => {
          this.configNames = names;
        });
      });
    else this.dataset = undefined;
  }

  select: callbackType = (config) => this.progressionData.setConfig(config);

  remove: callbackType = (config) => {
    delete_config(config).then(() => this.updateData(this.dataset?.name));
    if (config === this.config) this.progressionData.setConfig(undefined);
  };

  create: createType = () => {
    const data: DataType = {
      columns: this.dataset!.columns,
      dataset: this.dataset!.name,
    };
    this.dialog
      .open(DialogContentNewConfig, { data })
      .afterClosed()
      .subscribe((config) => {
        if (config)
          post_config(this.dataset!.name, config).then(() =>
            this.updateData(this.dataset?.name)
          );
      });
  };
}
