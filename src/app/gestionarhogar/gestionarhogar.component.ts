import { ChangeDetectionStrategy, Component, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HogarService } from '@app/services/hogar.service';
import jsPDF from 'jspdf';


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
  nombreUsuario: string = '';

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
    const nombreUsuario = sessionStorage.getItem('nombreUsuario');
    this.esCreador = creador === 'true';

    if (id && nombre) {
      this.idHogar = +id;
      this.nombreHogar = nombre;
      this.seccionActiva = 'gastos'; 
    } else {
      console.warn("No se encontró información del hogar.");
      this.router.navigate(['/bienvenida']);
    }

    if (nombreUsuario) {
      this.nombreUsuario = nombreUsuario;
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

  generarPDF() {
      const doc = new jsPDF();

  // Título del reporte
  doc.setFontSize(18);
  doc.text('Reporte de Monto Individual', 105, 20, { align: 'center' });

  // Fecha actual
  const fecha = new Date().toLocaleDateString();
  doc.setFontSize(11);
  doc.text(`Fecha: ${fecha}`, 20, 30);

  // Línea separadora
  doc.line(20, 35, 190, 35); // línea horizontal

  // Sección: Resumen
  doc.setFontSize(14);
  doc.text('Resumen', 20, 45);
  doc.setFontSize(11);
  doc.text('Este reporte presenta un resumen del monto individual correspondiente.', 20, 52);

  // Sección: Detalles
  doc.setFontSize(14);
  doc.text('Detalles del Reporte', 20, 65);
  doc.setFontSize(11);
  doc.text(`- Usuario: alan`, 25, 72);
  doc.text('- Monto calculado: $1,200.00 MXN', 25, 79);
  doc.text('- Periodo: Mayo 2025', 25, 86);

  // Sección: Conclusión
  doc.setFontSize(14);
  doc.text('Conclusión', 20, 100);
  doc.setFontSize(11);
  doc.text('El monto ha sido determinado con base en los datos registrados en el sistema.', 20, 107);

  // Guardar el documento
  doc.save('reporte-monto-individual.pdf');
  }
}
