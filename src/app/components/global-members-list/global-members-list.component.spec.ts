import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalMembersListComponent } from './global-members-list.component';

describe('GlobalMembersListComponent', () => {
  let component: GlobalMembersListComponent;
  let fixture: ComponentFixture<GlobalMembersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalMembersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalMembersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
