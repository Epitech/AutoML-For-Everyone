import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

type PredictResult = {[key:string]:any};

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
  status: "not started" | 'starting' | 'started' | 'done' = "not started";
  predictData: PredictType = {};
  predictResult?: PredictResult;
  predictFile?: File;

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
        if (refresh && (this.status === 'starting' || this.status === 'started'))
          setTimeout(
            ({ id }: ModelComponent) => this.checkStatus(id),
            2000,
            this
          );
      })
      .catch((e) => {
        console.error('error get_status', e);
        this.status = "not started";
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
        get_predict(this.id, this.predictData).then((r: PredictResult) => {
          this.predictResult = r;
        });
    });
  }

  csv_predict() {
    if (!this.predictFile) return;

    const fd = new FileReader();
    fd.onload = () => {
      if (!fd.result) return;

      const lines = fd.result.toString().split('\n');

      if (lines.length < 2) return alert(lines.length);

      const columns = lines[0].split(',');
      const rows = lines[1].split(',');
      console.log(columns, rows);
      columns.forEach((c, i) => {
        if (this.predictColumns.includes(c)) this.predictData[c] = rows[i];
      });
      get_predict(this.id, this.predictData).then((r: PredictResult) => {
        this.predictResult = r;
      });
    };
    fd.readAsText(this.predictFile);
  }

  setFile(event: any) {
    const files: FileList = event.target.files;
    if (files.length !== 1) return;

    this.predictFile = files[0];
  }
}
