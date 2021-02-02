import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { get_config, post_model, ModelType, get_lint } from '../../api2';

import { DataType, EmittedType } from '../table/table.component';
import {
  DialogNewModelComponent,
  ModelDataType,
} from '../dialog-new-model/dialog-new-model';

type Config = EmittedType & {
  models: string[];
};

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnChanges {
  @Input() id!: string;
  config?: Config & DataType;
  model?: string;
  newModel?: ModelType;

  constructor(public dialog: MatDialog) {}

  ngOnChanges({ id: { currentValue: id } }: { id: SimpleChange }) {
    this.id = id;
    get_config(id).then((config: Config) => {
      console.log('config', config);
      this.config = config;
      get_lint(id).then(({ lints }) => {
        console.log('lint', lints);
        this.config!.lints = lints;
      });
    });
  }

  changeModel(model: string) {
    this.model = model;
  }

  openDialog() {
    if (!this.newModel)
      this.newModel = {
        generations: 100,
        population_size: 100,
        offspring_size: 100,
        mutation_rate: 0.9,
        crossover_rate: 0.1,
        scoring: 'accuracy',
        subsample: 1.0,
        early_stop: 10,
      };

    const data: ModelDataType = {
      dispatch: (m) => {
        this.newModel = m;
      },
      model: this.newModel,
    };

    const dialogRef = this.dialog.open(DialogNewModelComponent, { data });

    dialogRef.afterClosed().subscribe((create: boolean) => {
      if (create)
        post_model(this.id, this.newModel!).then((model) => {
          this.model = model.id;
          this.config!.models.push(model.id);
        });
    });
  }

  getPredictColumns = () =>
    Object.keys(this.config!.columns).filter(
      (c) => this.config!.columns[c] && c !== this.config!.label
    );
}
