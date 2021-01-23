import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import { get_config, post_model, ModelType } from '../../api2';

type Fields = { [key: string]: boolean };
type Config = {
  columns: Fields;
  label: string;
  models: string[];
};

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnChanges {
  @Input() id!: string;
  config?: Config;
  model?: string;

  ngOnChanges({ id }: { id: SimpleChange }) {
    this.refresh(id.currentValue);
  }

  changeModel(model: string) {
    this.model = model;
  }

  refresh(id: string) {
    this.id = id;
    get_config(id).then((config: Config) => {
      console.log('config', config);
      this.config = config;
    });
  }

  openDialog() {
    const model: ModelType = { generations: 2 };
    post_model(this.id, model).then(() => this.refresh(this.id));
  }
}
