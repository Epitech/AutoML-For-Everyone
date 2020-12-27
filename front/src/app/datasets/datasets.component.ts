import { Component, OnInit } from '@angular/core';
import { get_datasets } from '../../api';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.css'],
})
export class DatasetsComponent implements OnInit {
  datasets: string[];

  constructor() {
    this.datasets = [];
  }

  ngOnInit(): void {
    get_datasets().then((datasets) => {
      this.datasets = datasets;
    });
  }
}
