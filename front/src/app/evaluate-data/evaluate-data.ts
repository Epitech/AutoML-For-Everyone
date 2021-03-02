import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, combineLatest } from 'rxjs';
import * as Papa from 'papaparse';

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

type CsvRow = { [key: string]: string };

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
        if (!file || !this.config) {
          return;
        }

        const config: ConfigType = this.config;
        const expectedColumns: string[] = Object.keys(
          this.config.columns
        ).filter(
          (key) => config.columns[key] && key !== config.label
        );
        console.log(expectedColumns);

        // Clean a row by selecting only columns used in the config
        function cleanRow(row: CsvRow): CsvRow | undefined {
          const cleanedRow: CsvRow = {};

          for (const key of expectedColumns) {
            if (row[key]) {
              cleanedRow[key] = row[key];
            } else {
              alert(
                'Missing at least one of required columns in the csv file:' +
                  ` ${expectedColumns}`
              );
              return;
            }
          }
          return cleanedRow;
        }

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result: { data: CsvRow[] }) => {
            // Get the prediction from the server
            const cleaned = result.data.map(cleanRow);
            get_predict(this.id!, cleaned).then(
              (predictions: { [key: string]: any }[]) => {
                const newData = predictions.map((prediction, i) => ({
                  ...result.data[i],
                  ...prediction,
                }));
                // Transform back the data into CSV
                const newCsv = Papa.unparse(newData);

                // Open a browser download dialog for the user to save the result
                const element = document.createElement('a');
                element.setAttribute(
                  'href',
                  'data:text/plain;charset=utf-8,' + encodeURIComponent(newCsv)
                );
                element.setAttribute('download', 'result_'.concat(file.name));
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }
            );
          },
        });
      });
  };
}
