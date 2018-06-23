import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelsManagementPanelComponent } from './channels-management-panel.component';

describe('ChannelsManagementPanelComponent', () => {
  let component: ChannelsManagementPanelComponent;
  let fixture: ComponentFixture<ChannelsManagementPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelsManagementPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelsManagementPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
