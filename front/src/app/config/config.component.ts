import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import {
  get_config,
  post_model,
  ModelType,
  get_sweetviz_url,
  get_lint,
} from '../../api2';

import { DataType, EmittedType } from '../table/table.component';

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

  constructor(private sanitizer: DomSanitizer) {}

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

  refresh(id: string) {}

  openDialog() {
    const model: ModelType = { generations: 2 };
    post_model(this.id, model).then((model) => {
      this.model = model.id;
      this.config!.models.push(model.id);
    });
  }

  sweetviz = () =>
    this.sanitizer.bypassSecurityTrustResourceUrl(get_sweetviz_url(this.id!));
}
