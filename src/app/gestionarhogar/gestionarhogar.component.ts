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
  seccionActiva: string = 'gastos';
  nombreHogar: string = '';
  idHogar: number | null = null;
  residentes: any[] = []; 

  private subscription: Subscription = new Subscription();

  constructor(private hogarService: HogarService,  private router: Router) {}

  ngOnInit() {
    this.subscription = this.hogarService.nombreHogar$.subscribe(
      nombre => this.nombreHogar = nombre 
    );

    this.subscription.add(
      this.hogarService.idHogar$.subscribe(
      id => this.idHogar = id
      )
    );

  const id = sessionStorage.getItem('idHogar');
  const nombre = sessionStorage.getItem('nombreHogar');

  if (id && nombre) {
    this.idHogar = +id;
    this.nombreHogar = nombre;
    this.seccionActiva = 'gastos'; 
  } else {
    console.warn("No se encontró información del hogar.");
    this.router.navigate(['/bienvenida']);
  }

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  mostrarResidentes() {
    this.seccionActiva = 'residentes';
    if (!this.residentes || this.residentes.length === 0) {
      if (this.idHogar != null) {
        this.hogarService.getResidentes(this.idHogar).subscribe(response => {
          if (response.status === 'Correcto') {
            this.residentes = response.residentes;
          }
        });
      } else {
        console.warn('ID del hogar no definido.');
      }
    }
  }

}
