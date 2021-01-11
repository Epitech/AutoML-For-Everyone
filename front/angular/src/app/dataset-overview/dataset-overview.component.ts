import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import {
  get_config,
  launch_train,
  put_config,
  get_sweetviz,
  launch_export,
  post_predict,
  get_lint,
  get_train_status,
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
  lints: { [key: string]: string[] } | undefined;
  status: 'started' | 'done' | null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {
    this.id = '';
    this.status = null;
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
        this.predict_result = 'none';
        this.checkStatus();
      });
    });
  }

  changeCheck(key: string, checked: boolean) {
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
    put_config(this.id, this.dataset)
      .then(() => get_lint(this.id))
      .then(({ lints }) => {
        this.lints = lints;
      });
  }

  train(): void {
    put_config(this.id, this.dataset)
      .then(() => get_lint(this.id))
      .then(({ lints }) => {
        this.lints = lints;
        if (Object.keys(lints).length) {
          this.dialog.open(DialogContentConfirm);
        } else {
          launch_train(this.id).then(() => {
            this.status = 'started';
            setTimeout(this.checkStatus, 5000);
          });
        }
      });
  }

  predict(): void {
    post_predict(this.id, this.train_data).then((nb) => {
      this.predict_result = nb;
    });
  }

  export(): void {
    launch_export(this.id);
  }

  get_sweetviz() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(get_sweetviz(this.id));
  }

  openLintDialog(column: string) {
    if (this.lints) {
      this.dialog.open(DialogContentLints, {
        data: { column, lints: this.lints[column] },
      });
    }
  }

  checkStatus(id: string | undefined = undefined) {
    get_train_status(id || this.id).then(({ status }) => {
      if (this.status !== status) this.status = status;
      if (status === 'started') {
        setTimeout(({ id }) => this.checkStatus(id), 5000, this);
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

@Component({
  selector: 'dialog-content-confirm',
  templateUrl: 'dialog-content-confirm.html',
})
export class DialogContentConfirm {}

export interface DialogData {
  column: string;
  lints: string[];
}

@Component({
  selector: 'dialog-content-lints',
  templateUrl: 'dialog-content-lints.html',
})
export class DialogContentLints {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
