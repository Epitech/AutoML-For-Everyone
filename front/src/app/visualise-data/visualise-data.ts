import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ProgressionDataService } from '../progression-data.service';
import { get_dataset_sweetviz_url } from '../../api2';

@Component({
  selector: 'app-visualise-data',
  templateUrl: 'visualise-data.html',
  styleUrls: ['visualise-data.css'],
})
export class VisualiseDataComponent {
  url?: SafeResourceUrl;

  constructor(
    public progressionData: ProgressionDataService,
    private sanitizer: DomSanitizer
  ) {
    this.progressionData.getDataset().subscribe({
      next: (id) => {
        this.url =
          id &&
          this.sanitizer.bypassSecurityTrustResourceUrl(
            get_dataset_sweetviz_url(id)
          );
      },
    });
  }
}
