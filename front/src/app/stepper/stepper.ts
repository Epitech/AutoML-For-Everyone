import { Component } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

import { ProgressionDataService } from '../progression-data.service';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.html',
  styleUrls: ['./stepper.css'],
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

  constructor(public progressionData: ProgressionDataService) {
    this.progressionData.getDataset().subscribe({
      next: (id) => {
        this.selectDataDone = id !== undefined;
      },
    });
    // todo when config is done
    // this.progressionData.getConfig().subscribe({
    //   next: (id)=>{
    //     this.createConfigDone = id !== undefined
    //   }
    // })
  }
}
