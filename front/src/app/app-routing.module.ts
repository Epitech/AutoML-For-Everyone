import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DatasetOverviewComponent } from './old-dataset-overview/dataset-overview.component';
import { DatasetsComponent } from './old-datasets/datasets.component';
import { DatavizComponent } from './old-dataviz/dataviz.component';

const routes: Routes = [
  { path: '', component: DatasetsComponent },
  { path: 'dataset/:id', component: DatasetOverviewComponent },
  { path: 'dataviz/:id', component: DatavizComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
