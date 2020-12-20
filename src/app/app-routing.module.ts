import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatasetOverviewComponent } from './dataset-overview/dataset-overview.component';
import { ModelSelectionComponent } from './model-selection/model-selection.component';
import { TrainComponent } from './train/train.component';
import { PredictionComponent } from './prediction/prediction.component';

const routes: Routes = [
  { path: '', component: DatasetOverviewComponent },
  { path: 'model', component: ModelSelectionComponent },
  { path: 'train', component: TrainComponent },
  { path: 'predict', component: PredictionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
