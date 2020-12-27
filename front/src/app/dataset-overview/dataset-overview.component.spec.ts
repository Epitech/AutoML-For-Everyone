import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetOverviewComponent } from './dataset-overview.component';

describe('DatasetOverviewComponent', () => {
  let component: DatasetOverviewComponent;
  let fixture: ComponentFixture<DatasetOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
