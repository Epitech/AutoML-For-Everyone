import { Component } from '@angular/core';

import { ProgressionDataService } from '../progression-data.service';

import { get_export } from '../../api2';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-evaluate-data',
  templateUrl: 'evaluate-data.html',
  styleUrls: ['evaluate-data.css'],
})
export class EvaluateDataComponent {
  shap_image?: string;
  matrix_image?: string;
  id!: string;

  constructor(public progressionData: ProgressionDataService) {
    combineLatest(
      this.progressionData.getModel(),
      this.progressionData.getTrained(),
      (model, trained) => ({
        model, trained
      })
    ).subscribe(({model, trained}) => {
      if (model !== undefined && trained === true) {
        this.id = model;
        this.updatePath();
      } else {
        this.shap_image = undefined;
        this.matrix_image = undefined;
      }
    });
  }

  export = () => get_export(this.id);

  updatePath() {
    this.matrix_image = `http://localhost:5000/model/${this.id}/confusion_matrix`;
    this.shap_image = `http://localhost:5000/model/${this.id}/shap_value`;
  }
}
