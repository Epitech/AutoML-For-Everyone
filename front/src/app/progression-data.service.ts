import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressionDataService {
  private _dataset?: string = undefined;
  private dataset$ = new BehaviorSubject(this._dataset);

  setDataset(d?: string) {
    this.setConfig(undefined);
    this._dataset = d;
    this.dataset$.next(this._dataset);
  }

  getDataset() {
    return this.dataset$.asObservable();
  }

  private _config?: string = undefined;
  private config$ = new BehaviorSubject(this._config);

  setConfig(c?: string) {
    this._config = c;
    this.config$.next(this._config);
  }

  getConfig() {
    return this.config$.asObservable();
  }

  private _model?: string = undefined;
  private model$ = new BehaviorSubject(this._model);

  setModel(c?: string) {
    this._model = c;
    this.model$.next(this._model);
  }

  getModel() {
    return this.model$.asObservable();
  }
}
