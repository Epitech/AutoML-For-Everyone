import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

type PredictResult = { [key: string]: any };

type Dataset = {
  columns: string[];
  configs: string[];
  name: string;
};

import {
  get_model,
  ModelType,
  post_train,
  get_status,
  get_export,
  get_predict,
  get_matrix,
  get_shap
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
  model?: { model_config: ModelType };
  status: 'not started' | 'starting' | 'started' | 'done' = 'not started';
  logs: string = '';
  predictData: PredictType[] = [];
  predictResult?: PredictResult[];
  predictFile?: File;
  img_shap: string = "";
  img_matrix: string = "";
  dataset_name: string = "";

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {}

  ngOnChanges({
    id,
    predictColumns
  }: {
    id: SimpleChange;
    predictColumns: SimpleChange;
  }) {
    if (!this.predictData.length) {
      const predictData: PredictType = {};
      predictColumns.currentValue.forEach((col: string) => {
        predictData[col] = '';
      });
      this.predictData.push(predictData);
    }

    if (predictColumns) this.predictColumns = predictColumns.currentValue;

    if (id) {
      get_model(id.currentValue).then((model) => {
        this.checkStatus(this.id, false);
        console.log('model', model);
        this.model = model;
      });
    }
  }

  launchTrain = () =>
    post_train(this.id).then(() => {
      console.log('train launched');
      this.status = 'starting';
      this.checkStatus(this.id);
    });

  checkStatus(id: string, refresh: boolean = true) {
    get_status(id)
      .then(({ status, logs }) => {
        console.log('train', status);
        this.status = status;
        this.logs = logs;
        if (
          refresh &&
          (this.status === 'starting' || this.status === 'started')
        )
          setTimeout(
            ({ id }: ModelComponent) => this.checkStatus(id),
            2000,
            this
          );
      })
      .catch((e) => {
        console.error('error get_status', e);
        this.status = 'not started';
      });
  }

  export = () => get_export(this.id);

  openPredict() {
    const data: PredictData = {
      dispatch: (column, value) => {
        this.predictData[0][column] = value;
      },
      predictColumns: this.predictData[0],
    };

    const dialogRef = this.dialog.open(DialogPredictComponent, { data });

    dialogRef.afterClosed().subscribe((predict: boolean) => {
      if (predict)
        get_predict(this.id, this.predictData).then((r: PredictResult[]) => {
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

      const names = lines.shift()!.split(',');
      this.predictData.length = 0;
      lines.forEach((line) => {
        const cols = line.split(',');
        if (!line.length) return;

        const data: PredictType = {};

        names.forEach((c, i) => {
          if (this.predictColumns.includes(c)) data[c] = cols[i];
        });

        this.predictData.push(data);
      });
      console.log('doit');
      get_predict(this.id, this.predictData).then((r: PredictResult[]) => {
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

  displayValues() {
    this.img_matrix = `http://localhost:5000/model/${this.id}/confusion_matrix`
    this.img_shap = `http://localhost:5000/model/${this.id}/shap_value`
  }
}
