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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app';
import { TopbarComponent } from './header/header';
import { DialogContentNewConfig } from './dialog-new-config/dialog-new-config';
import { HomeComponent } from './stepper/stepper';
import { NewProjectComponent } from './new-project/new-project';
import { SelectDataComponent } from './select-data/select-data';
import { VisualiseDataComponent } from './visualise-data/visualise-data';
import { ProgressionDataService } from './progression-data.service';
import { DocaposteListComponent } from './docaposte-list/docaposte-list';
import { SelectConfigComponent } from './select-config/select-config';
import { PropPipe } from './prop.pipe';
import { FilesizePipe } from './filesize.pipe';
import { DialogContentNewData } from './dialog-new-data/dialog-new-data';
import { DialogContentLint } from './dialog-lint/dialog-lint';

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    DialogContentNewConfig,
    DialogContentNewData,
    DialogContentLint,
    HomeComponent,
    NewProjectComponent,
    SelectDataComponent,
    VisualiseDataComponent,
    DocaposteListComponent,
    SelectConfigComponent,
    PropPipe,
    FilesizePipe,
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
  providers: [ProgressionDataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
