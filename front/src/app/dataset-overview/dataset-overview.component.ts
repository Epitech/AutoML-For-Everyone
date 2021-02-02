import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { get_dataset, post_config } from '../../api2';
import { DataType, EmittedType } from '../table/table.component';
import { DialogContentNewConfig } from '../dialog-new-config/dialog-new-config';

type Fields = { [key: string]: boolean };
type Dataset = {
  columns: string[];
  configs: string[];
  name: string;
};

@Component({
  selector: 'app-dataset-overview',
  templateUrl: 'dataset-overview.component.html',
  styleUrls: ['dataset-overview.component.css'],
})
export class DatasetOverviewComponent implements OnInit {
  dataset?: Dataset;
  private sub: any;
  config?: string;
  newConfig?: EmittedType;
  id?: string;

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.sub = this.route.params.subscribe((params) => {
      this.id = params['id'];
      get_dataset(params['id']).then((dataset: Dataset) => {
        if (!dataset) return console.error('no dataset');
        this.dataset = dataset;
        console.log(dataset);
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  openDialog() {
    const emitted: EmittedType = this.newConfig || {
      columns: this.dataset!.columns.reduce(
        (obj, col) => ({ ...obj, [col]: false }),
        {} as Fields
      ),
      label: undefined,
      model_type: "regression",
    };

    const data: DataType = {
      ...emitted,
      dispatch: (value: EmittedType) => {
        this.newConfig = value;
      },
      lints: {},
      id: this.id,
    };

    const dialogRef = this.dialog.open(DialogContentNewConfig, { data });

    dialogRef.afterClosed().subscribe((create: boolean) => {
      if (create)
        post_config(this.id!, {
          ...this.newConfig,
        }).then((config) => {
          this.config = config.id;
          this.dataset!.configs.push(config.id);
        });
    });
  }

  changeConfig(config: string) {
    this.config = config;
  }
}
