import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, combineLatest } from 'rxjs';

import {
  get_conf_matrix_url,
  get_export,
  get_shap_url,
  get_predict,
  get_config,
  ConfigType,
  get_model,
  Model,
} from '../../api';

import { DialogContentNewData } from '../dialog-new-data/dialog-new-data';
import { ProgressionDataService } from '../progression-data.service';

type Metric = {
  metric: string;
  value: number;
};

@Component({
  selector: 'app-evaluate-data',
  templateUrl: 'evaluate-data.html',
  styleUrls: ['evaluate-data.css'],
})
export class EvaluateDataComponent {
  shap_image?: string;
  matrix_image?: string;
  id?: string;
  config?: ConfigType;
  model?: Model;
  dataset?: string;

  metricsColumnsToDisplay = ['metric', 'value'];
  metrics = new BehaviorSubject<Metric[]>([]);

  constructor(
    public progressionData: ProgressionDataService,
    public dialog: MatDialog
  ) {
    combineLatest(
      this.progressionData.getDataset(),
      this.progressionData.getModel(),
      this.progressionData.getTrained(),
      this.progressionData.getConfig(),
      (dataset, model, trained, config) => ({ dataset, model, trained, config })
    ).subscribe(({ dataset, model, trained, config }) => {
      if (config)
        get_config(config).then((config) => {
          this.config = config;
        });
      if (model) {
        get_model(model).then((model) => {
          this.model = model;
          this.createMetrics(model);
        });
      }
      this.dataset = dataset;
      this.id = model;
      if (model && trained) {
        this.matrix_image = get_conf_matrix_url(model);
        this.shap_image = get_shap_url(model);
      } else {
        this.shap_image = undefined;
        this.matrix_image = undefined;
      }
    });
  }

  createMetrics(model: Model) {
    let metrics: Metric[] = [];
    const addMetric = (metric: string, value?: number) => {
      if (value) {
        metrics.push({
          metric,
          value,
        });
      }
    };
    addMetric('Training accuracy', model.analysis.training_accuracy);
    addMetric('Testing accuracy', model.analysis.testing_accuracy);
    addMetric('F1 score', model.analysis.f1_score);
    console.log('Metrics', metrics);
    this.metrics.next(metrics);
  }

  export = () => get_export(this.id!);

  predictCSV = () => {
    this.dialog
      .open(DialogContentNewData)
      .afterClosed()
      .subscribe((file: File) => {
        if (!file) return;

        const fd = new FileReader();
        fd.onload = () => {
          if (!fd.result) return alert('file error');

          const lines = fd.result.toString().split('\n');

          if (lines.length < 2) return alert('file is invalid');

          const names = lines.shift()!.split(',');
          const predictData: {
            [key: string]: string;
          }[] = [];

          lines.forEach((line) => {
            if (!line.length) return;
            const cols = line.split(',');
            const data: { [key: string]: string } = {};

            names.forEach((c, i) => {
              if (this.config!.columns[c]) data[c] = cols[i];
            });

            predictData.push(data);
          });
          get_predict(this.id!, predictData).then(
            (result: { [key: string]: any }[]) => {
              const text = result
                .map((obj_result, i) => ({
                  ...predictData[i],
                  ...obj_result,
                }))
                .map((obj) => Object.values(obj).join(','))
                .join('\n');

              var element = document.createElement('a');
              element.setAttribute(
                'href',
                'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
              );
              element.setAttribute('download', 'result_'.concat(file.name));
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }
          );
        };
        fd.readAsText(file);
      });
  };
}
