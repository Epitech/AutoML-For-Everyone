import { Component, OnInit } from '@angular/core';

import { get_datasets } from '../../api2';

@Component({
  selector: 'app-select-data',
  templateUrl: 'select-data.html',
  styleUrls: ['select-data.css'],
})
export class SelectDataComponent implements OnInit {
  datasets?: string[];

  ngOnInit() {
    get_datasets().then((d) => {
      this.datasets = d;
    });
  }
}
