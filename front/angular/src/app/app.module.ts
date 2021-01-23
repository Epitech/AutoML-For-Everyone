import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopbarComponent } from './topbar/topbar.component';
import { DatasetOverviewComponent, DialogContentConfirm, DialogContentLints } from './dataset-overview/dataset-overview.component';
import { ButtonComponent } from './button/button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { SliderComponent } from './slider/slider.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    DatasetOverviewComponent,
    ButtonComponent,
    SliderComponent,
    DatasetsComponent,
    DialogContentConfirm,
    DialogContentLints,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatSliderModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    MatSlideToggleModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
