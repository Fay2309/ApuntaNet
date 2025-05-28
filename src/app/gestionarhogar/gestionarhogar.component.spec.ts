import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarhogarComponent } from './gestionarhogar.component';

describe('GestionarhogarComponent', () => {
  let component: GestionarhogarComponent;
  let fixture: ComponentFixture<GestionarhogarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarhogarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarhogarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
