import { Component } from '@angular/core';

import { get_datasets, DatasetType, get_dataset } from '../../api2';

import { ProgressionDataService } from '../progression-data.service';
import { callbackType, createType } from '../docaposte-list/docaposte-list';

@Component({
  selector: 'app-select-data',
  templateUrl: 'select-data.html',
  styleUrls: ['select-data.css'],
})
export class SelectDataComponent {
  datasets?: DatasetType[];
  dataset?: string;

  constructor(public progressionData: ProgressionDataService) {
    get_datasets().then((ds) => {
      Promise.all(ds.map((d) => get_dataset(d))).then((datasets) => {
        this.datasets = datasets;
      });
    });
    this.progressionData.getDataset().subscribe({
      next: (d) => {
        this.dataset = d;
      },
    });
  }

  select: callbackType = (dataset) => {
    this.progressionData.setDataset(dataset);
  };

  remove: callbackType = (dataset) => {
    console.warn('todo: remove dataset');
    if (dataset === this.dataset) this.progressionData.setDataset(undefined); // selected dataset was removed
  };

  create: createType = () => {
    console.warn('todo: file popup');
  };
}
