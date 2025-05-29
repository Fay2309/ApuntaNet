import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HogarService } from '@app/services/hogar.service';


@Component({
  selector: 'app-gestionarhogar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './gestionarhogar.component.html',
  styleUrl: './gestionarhogar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionarhogarComponent {
  nombreHogar: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private hogarService: HogarService) {}

  ngOnInit() {
    this.subscription = this.hogarService.nombreHogar$.subscribe(
      nombre => this.nombreHogar = nombre
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
