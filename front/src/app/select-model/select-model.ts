import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  delete_model,
  get_config,
  post_model,
  get_model,
  ModelConfig,
} from '../../api';

import { callbackType, createType } from '../docaposte-list/docaposte-list';
import { ProgressionDataService } from '../progression-data.service';
import { DialogNewModelComponent } from '../dialog-new-model/dialog-new-model';

@Component({
  selector: 'app-select-model',
  templateUrl: 'select-model.html',
  styleUrls: ['select-model.css'],
})
export class ConfigModelComponent {
  model_names?: string[];
  model_ids?: string[];
  config?: string;
  model?: string;
  model_type: string = 'classification';

  constructor(
    public progressionData: ProgressionDataService,
    public dialog: MatDialog
  ) {
    this.progressionData.getConfig().subscribe((c) => {
      this.config = c;
      this.updateList();
    });
    this.progressionData.getModel().subscribe((m) => {
      this.model = m;
    });
  }

  updateList(): void {
    if (this.config) {
      get_config(this.config).then((response) => {
        Promise.all(
          response.models.map((id) =>
            get_model(id).then((model) => {
              const res = `${model.model_config.config_dict ?? 'Default models'}, ${
                model.model_config.scoring ?? 'Default scoring'
              }`;
              console.log(model, res);
              return res;
            })
          )
        ).then((desc) => {
          this.model_names = desc;
        });
        this.model_ids = response.models;
        this.model_type = response.model_type;
      });
    } else {
      this.model_ids = undefined;
    }
  }

  select: callbackType = (model) => this.progressionData.setModel(model);

  remove: callbackType = (model) => {
    if (model === this.model) this.progressionData.setModel(undefined);
    delete_model(model).then(() => this.updateList());
  };

  create: createType = () => {
    const data: ModelConfig = {
      generations: 100,
      population_size: 100,
      offspring_size: 100,
      mutation_rate: 0.1,
      crossover_rate: 0.1,
      subsample: 1,
      early_stop: 100,
      scoring: this.model_type,
      config_dict: undefined,
    };
    this.dialog
      .open(DialogNewModelComponent, { data })
      .afterClosed()
      .subscribe((model) => {
        if (model) post_model(model, this.config).then(() => this.updateList());
      });
  };
}
