import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopbarComponent } from './topbar/topbar.component';
import { DatasetOverviewComponent } from './dataset-overview/dataset-overview.component';
import { ButtonComponent } from './button/button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatasetsComponent } from './datasets/datasets.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfigComponent } from './config/config.component';
import { TableComponent } from './table/table.component';
import { DialogContentNewConfig } from './dialog-new-config/dialog-new-config';
import { ModelComponent } from './model/model.component';
import { DialogLintComponent } from './dialog-lint/dialog-lint.component';

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    DatasetOverviewComponent,
    ButtonComponent,
    DatasetsComponent,
    ConfigComponent,
    TableComponent,
    DialogContentNewConfig,
    ModelComponent,
    DialogLintComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
