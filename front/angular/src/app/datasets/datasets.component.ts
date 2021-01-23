import { Component, OnInit } from '@angular/core';
import { upload_dataset } from '../../api';
import { get_datasets } from '../../api2';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.css'],
})
export class DatasetsComponent implements OnInit {
  datasets: string[];
  fileToUpload: File | null = null;

  constructor() {
    this.datasets = [];
  }

  ngOnInit(): void {
    get_datasets().then((datasets) => {
      this.datasets = datasets;
    });
  }

  upload() {
    if (this.fileToUpload) upload_dataset(this.fileToUpload);
  }

  handleChange(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    if (!target?.files) return;
    const files = target.files;
    if (files.length === 0) return;
    if (files.length !== 1) return alert('(tmp) one file only'); // todo
    this.fileToUpload = files[0];
  }
}
