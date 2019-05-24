import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularResizeElementDirective } from './angular-resize-element.directive';

describe('AngularResizeElementComponent', () => {
  let component: AngularResizeElementDirective;
  let fixture: ComponentFixture<AngularResizeElementDirective>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AngularResizeElementDirective ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularResizeElementDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
