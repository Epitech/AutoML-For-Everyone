import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import {
  get_config,
  post_model,
  ModelType,
  get_sweetviz_url,
  get_lint,
} from '../../api2';

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

  constructor(private sanitizer: DomSanitizer) {}

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
      get_lint(id).then(({ lints }) => {
        console.log('lint', lints);
      });
    });
  }

  openDialog() {
    const model: ModelType = { generations: 2 };
    post_model(this.id, model).then(() => this.refresh(this.id));
  }

  sweetviz = () =>
    this.sanitizer.bypassSecurityTrustResourceUrl(get_sweetviz_url(this.id!));
}
