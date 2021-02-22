import { Component } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

import { ProgressionDataService } from '../progression-data.service';

@Component({
  selector: 'app-stepper',
  templateUrl: 'stepper.html',
  styleUrls: ['stepper.css'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class HomeComponent {
  selectDataDone: boolean = false;
  createConfigDone: boolean = false;
  createModelDone: boolean = false;
  modelTrainDone: boolean = false;

  constructor(public progressionData: ProgressionDataService) {
    this.progressionData.getDataset().subscribe((id) => {
      this.selectDataDone = id !== undefined;
    });
    this.progressionData.getConfig().subscribe((id) => {
      this.createConfigDone = id !== undefined;
    });
    this.progressionData.getModel().subscribe((id) => {
      this.createModelDone = id !== undefined;
    });
    this.progressionData.getTrained().subscribe((trained) => {
      this.modelTrainDone = !!trained;
    });
  }
}
