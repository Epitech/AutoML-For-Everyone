import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { get_dataset } from '../../api';

@Component({
  selector: 'app-dataset-overview',
  templateUrl: './dataset-overview.component.html',
  styleUrls: ['./dataset-overview.component.css'],
})
export class DatasetOverviewComponent implements OnInit, OnDestroy {
  dataset: any;
  private sub: any;
  config_nb: number;

  constructor(private route: ActivatedRoute) {
    this.dataset = [];
    this.config_nb = 0;
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe((params) => {
      get_dataset(params['id']).then((dataset) => {
        if (dataset === undefined) console.error('no dataset');
        else this.dataset = dataset;
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  change_config(index: number) {
    this.config_nb = index;
  }
}
