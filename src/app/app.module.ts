import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopbarComponent } from './topbar/topbar.component';
import { DatasetOverviewComponent } from './dataset-overview/dataset-overview.component';
import { ModelSelectionComponent } from './model-selection/model-selection.component';
import { PredictionComponent } from './prediction/prediction.component';
import { TrainComponent } from './train/train.component';
import { ButtonComponent } from './button/button.component';

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    DatasetOverviewComponent,
    ModelSelectionComponent,
    PredictionComponent,
    TrainComponent,
    ButtonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
