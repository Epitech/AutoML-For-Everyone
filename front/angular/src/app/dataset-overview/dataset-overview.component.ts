import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  get_config,
  launch_train,
  put_config,
  get_sweetviz,
  launch_export,
} from '../../api';

@Component({
  selector: 'app-dataset-overview',
  templateUrl: './dataset-overview.component.html',
  styleUrls: ['./dataset-overview.component.css'],
})
export class DatasetOverviewComponent implements OnInit, OnDestroy {
  dataset: { columns: { [key: string]: boolean } } | undefined;
  checked: boolean;
  private sub: any;
  config_nb: number;
  id: string;

  constructor(private route: ActivatedRoute) {
    this.config_nb = 0;
    this.checked = false;
    this.id = '';
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe((params) => {
      get_config(params['id']).then((dataset) => {
        console.log(dataset);
        this.id = params['id'];
        if (!dataset) console.error('no dataset');
        else this.dataset = dataset;
      });
    });
  }

  changeCheck(key: string, checked: boolean) {
    console.log('set', key, checked);
    if (this.dataset) this.dataset.columns[key] = checked;
  }

  save_config() {
    put_config(this.id, this.dataset);
  }

  train(): void {
    put_config(this.id, this.dataset).then(() => launch_train(this.id));
  }

  export(): void {
    launch_export(this.id);
  }

  getSweetVizUrl(): string {
    return get_sweetviz(this.id);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
