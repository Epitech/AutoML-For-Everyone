import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  get_model,
  ModelType,
  post_train,
  get_status,
  get_export,
  get_predict,
} from '../../api2';
import {
  DialogPredictComponent,
  PredictData,
  PredictType,
} from '../dialog-predict/dialog-predict';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css'],
})
export class ModelComponent implements OnChanges {
  @Input() id!: string;
  @Input() predictColumns!: string[];
  model?: ModelType;
  status: null | 'starting' | 'started' | 'done' = null;
  statusRunning = () => this.status === 'starting' || this.status === 'started';
  predictData: PredictType = {};
  predictResult?: number;

  constructor(public dialog: MatDialog) {}

  ngOnChanges({
    id,
    predictColumns,
  }: {
    id: SimpleChange;
    predictColumns: SimpleChange;
  }) {
    if (predictColumns && !Object.keys(this.predictData).length) {
      predictColumns.currentValue.forEach((col: string) => {
        this.predictData[col] = '';
      });
    }

    if (id)
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

  openPredict() {
    const data: PredictData = {
      dispatch: (column, value) => {
        this.predictData[column] = value;
      },
      predictColumns: this.predictData,
    };

    const dialogRef = this.dialog.open(DialogPredictComponent, { data });

    dialogRef.afterClosed().subscribe((predict: boolean) => {
      if (predict)
        get_predict(this.id, this.predictData).then((r: number) => {
          this.predictResult = r;
        });
    });
  }
}
