import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { get_dataset, DatasetType } from '../../api2';

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

  constructor(
    public progressionData: ProgressionDataService,
    public dialog: MatDialog
  ) {
    this.progressionData.getDataset().subscribe({
      next: (id) => {
        if (id)
          get_dataset(id).then((dataset) => {
            console.log(dataset);
            this.dataset = dataset;
          });
      },
    });
    this.progressionData.getConfig().subscribe({
      next: (c) => {
        this.config = c;
      },
    });
  }

  select: callbackType = (config) => {
    this.progressionData.setConfig(config);
  };

  remove: callbackType = (config) => {
    console.warn('todo: remove config');
    if (config === this.config) this.progressionData.setConfig(undefined); // selected config was removed
  };

  create: createType = () => {
    const data: DataType = {
      columns: this.dataset!.columns,
    };
    this.dialog
      .open(DialogContentNewConfig, { data })
      .afterClosed()
      .subscribe((ret) => {
        console.warn('todo: create config', ret);
      });
  };
}
