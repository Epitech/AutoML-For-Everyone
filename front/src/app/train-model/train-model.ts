import { Component } from '@angular/core';

import { get_model, post_train, get_status } from '../../api';

import { ProgressionDataService } from '../progression-data.service';

@Component({
  selector: 'app-train-model',
  templateUrl: 'train-model.html',
  styleUrls: ['train-model.css'],
})
export class TrainModelComponent {
  model?: any; // todo: add type
  logs?: string;

  constructor(public progressionData: ProgressionDataService) {
    this.progressionData.getModel().subscribe((id) => {
      if (id) {
        get_model(id).then((m) => {
          this.model = m;
          this.progressionData.setTrained(this.model.status === 'done');
          this.checkStatus();
        });
      } else {
        this.model = undefined;
      }
    });
  }

  train = () =>
    post_train(this.model!.id)
      .then(() => {
        this.model.status = 'starting';
        this.checkStatus();
      })
      .catch((err) => {
        console.error(err);
        this.model.status = 'error';
      });

  checkStatus = () =>
    get_status(this.model.id).then(({ status, logs }) => {
      this.model.status = status;
      this.progressionData.setTrained(status === 'done');
      this.logs = logs;
      if (status === 'starting' || status === 'started')
        setTimeout(() => this.checkStatus(), 5000, this);
    });
}
