import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DatasetOverviewComponent } from './dataset-overview/dataset-overview.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { ModelSelectionComponent } from './model-selection/model-selection.component';
import { TrainComponent } from './train/train.component';
import { PredictionComponent } from './prediction/prediction.component';

const routes: Routes = [
  { path: '', component: DatasetsComponent },
  { path: 'model', component: ModelSelectionComponent },
  { path: 'train', component: TrainComponent },
  { path: 'predict', component: PredictionComponent },
  { path: 'dataset/:id', component: DatasetOverviewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
