import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { get_dataset, post_config } from '../../api2';
import { MatDialog } from '@angular/material/dialog';
import { EmittedType } from '../table/table.component';
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
      this.refreshThis(params['id']);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  refreshThis(id: string) {
    get_dataset(id).then((dataset: Dataset) => {
      if (!dataset) return console.error('no dataset');
      this.dataset = dataset;
      console.log(dataset);
    });
  }

  openDialog() {
    const emitted: EmittedType = this.newConfig || {
      columns: this.dataset!.columns.reduce(
        (obj, col) => ({ ...obj, [col]: false }),
        {} as Fields
      ),
      label: undefined,
    };

    const dialogRef = this.dialog.open(DialogContentNewConfig, {
      data: {
        ...emitted,
        dispatch: (value: EmittedType) => {
          this.newConfig = value;
        },
      },
    });

    dialogRef.afterClosed().subscribe((create: boolean) => {
      if (create)
        post_config(this.id!, this.newConfig).then(() => {
          this.refreshThis(this.id!);
        });
    });
  }

  changeConfig(config: string) {
    this.config = config;
  }
}
