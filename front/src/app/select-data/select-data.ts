import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  get_datasets,
  DatasetType,
  get_dataset,
  delete_dataset,
  post_dataset,
} from '../../api';

import { ProgressionDataService } from '../progression-data.service';
import { callbackType, createType } from '../docaposte-list/docaposte-list';
import { DialogContentNewData } from '../dialog-new-data/dialog-new-data';

@Component({
  selector: 'app-select-data',
  templateUrl: 'select-data.html',
  styleUrls: ['select-data.css'],
})
export class SelectDataComponent {
  datasets?: DatasetType[];
  dataset?: string;

  constructor(
    public progressionData: ProgressionDataService,
    public dialog: MatDialog
  ) {
    this.updateDatasets();
    this.progressionData.getDataset().subscribe((d) => {
      this.dataset = d;
    });
  }

  updateDatasets(): void {
    get_datasets().then((ds) => {
      Promise.all(ds.map((d) => get_dataset(d))).then((datasets) => {
        this.datasets = datasets;
      });
    });
  }

  select: callbackType = (dataset) => {
    this.progressionData.setDataset(dataset);
  };

  remove: callbackType = (dataset) => {
    if (dataset === this.dataset) this.progressionData.setDataset(undefined);
    delete_dataset(dataset).then(() => this.updateDatasets());
  };

  create: createType = () => {
    this.dialog
      .open(DialogContentNewData)
      .afterClosed()
      .subscribe((file) => {
        if (file) post_dataset(file).then(() => this.updateDatasets());
      });
  };
}
