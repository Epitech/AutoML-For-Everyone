import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { AppComponent } from './app';
import { TopbarComponent } from './header/header';
import { DatasetOverviewComponent } from './old/old-dataset-overview/dataset-overview.component';
import { ButtonComponent } from './old/old-button/button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatasetsComponent } from './old/old-datasets/datasets.component';
import { ConfigComponent } from './old/old-config/config.component';
import { TableComponent } from './old/old-table/table.component';
import { DialogContentNewConfig } from './old/old-dialog-new-config/dialog-new-config';
import { ModelComponent } from './old/old-model/model.component';
import { DialogLintComponent } from './old/old-dialog-lint/dialog-lint.component';
import { DialogNewModelComponent } from './old/old-dialog-new-model/dialog-new-model';
import { DialogPredictComponent } from './old/old-dialog-predict/dialog-predict';
import { DatavizComponent } from './old/old-dataviz/dataviz.component';
import { HomeComponent } from './stepper/stepper';
import { NewProjectComponent } from './new-project/new-project';

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
    DialogNewModelComponent,
    DialogPredictComponent,
    DatavizComponent,
    HomeComponent,
    NewProjectComponent,
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
