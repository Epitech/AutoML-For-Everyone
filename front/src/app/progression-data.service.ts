import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressionDataService {
  private _dataset?: string = undefined;
  private dataset$ = new BehaviorSubject(this._dataset);

  setDataset(d: string) {
    this._dataset = d;
    this.dataset$.next(this._dataset);
  }

  getDataset() {
    return this.dataset$.asObservable();
  }
}
