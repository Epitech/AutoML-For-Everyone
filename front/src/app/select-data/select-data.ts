import { Component } from '@angular/core';

import { get_datasets } from '../../api2';

import { ProgressionDataService } from '../progression-data.service';
import { callbackType, createType } from '../docaposte-list/docaposte-list';

@Component({
  selector: 'app-select-data',
  templateUrl: 'select-data.html',
  styleUrls: ['select-data.css'],
})
export class SelectDataComponent {
  datasets?: string[];
  dataset?: string;

  constructor(public progressionData: ProgressionDataService) {
    get_datasets().then((ds) => {
      this.datasets = ds;
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
