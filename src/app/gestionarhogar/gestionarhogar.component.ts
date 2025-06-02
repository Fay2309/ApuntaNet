import { ChangeDetectionStrategy, Component, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
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
  public crearCategoriaForm: FormGroup;
  public submitted: boolean = false;
  public menuVisible: boolean = false;
  seccionActiva: string = 'gastos';
  nombreHogar: string = '';
  idHogar: number | null = null;
  esCreador: boolean = false;
  residentes: any[] = [];
  public modalVisible: number = 0;
  public error: number = 0;

  private subscription: Subscription = new Subscription();

  constructor(private hogarService: HogarService,  
    private router: Router, 
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef, 
    ) {
    this.crearCategoriaForm = this.fb.group({
      nombreCategoria: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]]
    });
  }

  ngOnInit() {
    this.subscription = this.hogarService.nombreHogar$.subscribe(
      nombre => this.nombreHogar = nombre 
    );

    this.subscription.add(
      this.hogarService.idHogar$.subscribe(
      id => this.idHogar = id
      )
    );

    this.subscription.add(
      this.hogarService.esCreador$.subscribe(
        esCreador => this.esCreador = esCreador
      )
    );

    const id = sessionStorage.getItem('idHogar');
    const nombre = sessionStorage.getItem('nombreHogar');
    const creador = sessionStorage.getItem('esCreador');
    this.esCreador = creador === 'true';

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

  //---------------------------------------------------------------------
  
  mostrarModalCategoria(): void {
    this.modalVisible = 1;
    this.error = 1;
    this.submitted = false;
    this.crearCategoriaForm.reset();
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.modalVisible = 0;
    this.cdr.detectChanges();
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


    getMensajeError(controlName: string): string {
    if (this.error === 1) {
      const control = this.crearCategoriaForm.get(controlName);
      if (control?.errors && (control.touched || this.submitted)) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      } 
    }
    return '';
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: Event): void {
    const target = event.target as HTMLElement;
    const avatarElement = this.elementRef.nativeElement.querySelector('.avatar');
    const menuElement = this.elementRef.nativeElement.querySelector('.menu');
    const modalElement = this.elementRef.nativeElement.querySelector('.modal-contenido');
    
    if (this.menuVisible && 
        !avatarElement.contains(target) && 
        !menuElement.contains(target)) {
      this.menuVisible = false;
      this.cdr.detectChanges();
    }

    if (this.modalVisible && 
        modalElement && 
        !modalElement.contains(target) &&
        target.className !== 'accion' && 
        !target.closest('.accion')) {  
      this.cerrarModal();
    }
  }
}
