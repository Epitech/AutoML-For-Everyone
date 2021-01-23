import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import { get_config, get_sweetviz_url, post_model } from '../../api2';
import { DomSanitizer } from '@angular/platform-browser';

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

  ngOnChanges(changes: { id: SimpleChange }) {
    this.refresh(changes.id.currentValue);
  }

  changeModel(model: string) {
    console.log('model', model);
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
    post_model(this.id, { generations: 0 }).then(() => this.refresh(this.id));
  }

  sweetviz = () =>
    this.sanitizer.bypassSecurityTrustResourceUrl(get_sweetviz_url(this.id));
}
