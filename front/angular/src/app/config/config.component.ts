import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import { get_config, get_sweetviz_url } from '../../api2';
import { DomSanitizer } from '@angular/platform-browser';

type Fields = { [key: string]: boolean };
type Config = {
  columns: Fields;
  label: string;
  models: any[];
};

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnChanges {
  @Input() id!: string;
  config?: Config;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: { id: SimpleChange }) {
    get_config(changes.id.currentValue).then((config: Config) => {
      console.log('config', config);
      this.config = config;
    });
  }

  sweetviz = () =>
    this.sanitizer.bypassSecurityTrustResourceUrl(get_sweetviz_url(this.id));
}
