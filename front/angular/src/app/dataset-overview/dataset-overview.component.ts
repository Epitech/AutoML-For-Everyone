import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  get_config,
  launch_train,
  put_config,
  get_sweetviz,
  launch_export,
  post_predict,
} from '../../api';

type Fields = { [key: string]: boolean };
type TrainFields = { [key: string]: string };
type Dataset = { columns: Fields; label: string };

@Component({
  selector: 'app-dataset-overview',
  templateUrl: './dataset-overview.component.html',
  styleUrls: ['./dataset-overview.component.css'],
})
export class DatasetOverviewComponent implements OnInit, OnDestroy {
  dataset: Dataset | undefined;
  private sub: any;
  id: string;
  train_data: TrainFields | undefined;
  predict_result: any;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    this.id = '';
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe((params) => {
      get_config(params['id']).then((dataset: Dataset) => {
        this.id = params['id'];
        if (!dataset) return console.error('no dataset');
        this.dataset = dataset;
        this.train_data = {};
        for (const col in dataset.columns) {
          if (col === dataset.label) continue;
          if (dataset.columns[col]) this.train_data![col] = '';
        }
        console.log(this.train_data);
        this.predict_result="none";
      });
    });
  }

  changeCheck(key: string, checked: boolean) {
    console.log('set', key, checked);
    if (this.dataset) this.dataset.columns[key] = checked;
  }

  changeLabel(key: string) {
    if (this.dataset === undefined) return;
    this.dataset.label = key;
  }

  changeTrain(key: string) {
    if (this.train_data === undefined) return;
    const toto = document.getElementById(`train_${key}`) as HTMLInputElement;
    this.train_data[key] = toto.value;
  }

  save_config() {
    put_config(this.id, this.dataset);
  }

  train(): void {
    put_config(this.id, this.dataset).then(() => launch_train(this.id));
  }

  predict(): void {
    post_predict(this.id, this.train_data)
      .then((res) => res.json())
      .then((nb) => {
        this.predict_result = nb;
      });
  }

  export(): void {
    launch_export(this.id);
  }

  get_sweetviz() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(get_sweetviz(this.id));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
