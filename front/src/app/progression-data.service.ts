import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressionDataService {
  private dataset$ = new BehaviorSubject<string | undefined>(undefined);
  private config$ = new BehaviorSubject<string | undefined>(undefined);
  private model$ = new BehaviorSubject<string | undefined>(undefined);
  private trained$ = new BehaviorSubject<boolean | undefined>(undefined);

  setDataset(d?: string) {
    this.setConfig(undefined);
    this.dataset$.next(d);
  }

  setConfig(c?: string) {
    this.setModel(undefined);
    this.config$.next(c);
  }

  setModel(m?: string) {
    this.setTrained(undefined);
    this.model$.next(m);
  }

  setTrained(t?: boolean) {
    this.trained$.next(t);
  }

  getDataset = () => this.dataset$.asObservable();
  getConfig = () => this.config$.asObservable();
  getModel = () => this.model$.asObservable();
  getTrained = () => this.trained$.asObservable();
}
