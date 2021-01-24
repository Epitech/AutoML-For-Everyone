import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import {
  get_model,
  ModelType,
  post_train,
  get_status,
  get_export,
} from '../../api2';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css'],
})
export class ModelComponent implements OnChanges {
  @Input() id!: string;
  model?: ModelType;
  status: null | 'starting' | 'started' | 'done' = null;
  statusRunning = () => this.status === 'starting' || this.status === 'started';

  ngOnChanges({ id }: { id: SimpleChange }) {
    get_model(id.currentValue).then((model: ModelType) => {
      this.checkStatus(this.id, false);
      console.log('model', model);
      this.model = model;
    });
  }

  launchTrain = () =>
    post_train(this.id).then(() => {
      console.log('train launched');
      this.status = 'starting';
      this.checkStatus(this.id);
    });

  checkStatus(id: string, refresh: boolean = true) {
    get_status(id)
      .then(({ status }) => {
        console.log('train', status);
        this.status = status;
        if (refresh && this.statusRunning())
          setTimeout(
            ({ id }: ModelComponent) => this.checkStatus(id),
            2000,
            this
          );
      })
      .catch((e) => {
        console.error('error get_status', e);
        this.status = null;
      });
  }

  export = () => get_export(this.id);
}
