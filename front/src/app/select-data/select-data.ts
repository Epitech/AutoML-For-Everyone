import { Component, ElementRef, ViewChild } from '@angular/core';

import {
  get_datasets,
  DatasetType,
  get_dataset,
  delete_dataset,
  post_dataset,
} from '../../api2';

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
  @ViewChild('file') file?: ElementRef<HTMLInputElement>;

  constructor(public progressionData: ProgressionDataService) {
    this.updateDatasets();
    this.progressionData.getDataset().subscribe({
      next: (d) => {
        this.dataset = d;
      },
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
    delete_dataset(dataset).then(() => this.updateDatasets());
    console.warn('todo: remove dataset');
    if (dataset === this.dataset) {
      this.progressionData.setDataset(undefined);
    } // selected dataset was removed
  };

  create: createType = () => {
    if (this.file) {
      console.log(this.file);
      this.file.nativeElement.click();
      console.log('clicking');
    }
  };

  fileSelected(): void {
    if (this.file && this.file.nativeElement.files) {
      Promise.all(
        Array.from(this.file.nativeElement.files).map((file) => {
          console.log('Sending file', file);
          post_dataset(file);
        })
      ).then(() => this.updateDatasets());
    }
  }
}
