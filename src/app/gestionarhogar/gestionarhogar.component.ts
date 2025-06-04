import { ChangeDetectionStrategy, Component, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HogarService } from '@app/services/hogar.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


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
  public crearTicketForm: FormGroup;
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
  categoriasDisponibles: any[] = []; 
  categoriasSeleccionadas: any[] = [];
  descripcionCategoria: string = '';

  private subscription: Subscription = new Subscription();

  constructor(private hogarService: HogarService,  
    private router: Router, 
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef, 
    ) {
    const fechaActual = new Date();
    const fechaExpiracion = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 30);

    this.crearCategoriaForm = this.fb.group({
      categoriaSeleccionada: ['', Validators.required]
    });
    this.crearTicketForm = this.fb.group({
      nombreTicket: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]],
      montoTicket: ['', [Validators.required, Validators.min(0.01)]],
      fechaCreacion: [{ 
        value: fechaActual.toISOString().split('T')[0], 
        disabled: true 
      }],
      fechaExpiracion: [{ 
        value: fechaExpiracion.toISOString().split('T')[0], 
        disabled: true 
      }]
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
    this.cargarCategoriasDisponibles();
    this.cargarCategoriasSeleccionadas();
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

  mostrarModalTicket(): void {
    this.modalVisible = 2;
    this.error = 2;
    this.submitted = false;
    this.crearCategoriaForm.reset();
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.modalVisible = 0;
    this.cdr.detectChanges();
  }

  //
  // // FUNCIONES PARA GESTIONAR HOGAR
  // 
  crearCategoria(): void {
  this.submitted = true;

  if (this.crearCategoriaForm.valid) {
    const datos = {
      id_hogar: this.idHogar, 
      id_categoria: this.crearCategoriaForm.value.categoriaSeleccionada
    };

    this.hogarService.agregarCategoriaAHogar(datos).subscribe({
      next: (respuesta: any) => {
        console.log('Categoría agregada:', respuesta);
        this.cerrarModal();
        window.location.reload();
      },
      error: (error: any) => {
        if (error.status === 400 && error.error.message) {
          alert(error.error.message);
        } else {
          console.error('Error al agregar categoría:', error);
        }
      }
    });
  } else {
    this.crearCategoriaForm.markAllAsTouched();
  }
}

actualizarDescripcionCategoria(): void {
  const idSeleccionado = this.crearCategoriaForm.value.categoriaSeleccionada;
  const categoria = this.categoriasDisponibles.find(c => c.id == idSeleccionado);
  this.descripcionCategoria = categoria?.descripcion || '';
}

  cargarCategoriasDisponibles(): void {
    if (this.idHogar !== null) {
      this.hogarService.obtenerCategoriasDisponibles(this.idHogar).subscribe({
        next: (categorias) => {
          this.categoriasDisponibles = categorias;
        },
        error: (err) => {
          console.error('Error al obtener categorías disponibles:', err);
        }
      });
    } else {
      console.warn('ID del hogar no definido para cargar categorías disponibles.');
    }
  }

  cargarCategoriasSeleccionadas(): void {
    if (!this.idHogar) return;

    this.hogarService.obtenerCategoriasSeleccionadas(this.idHogar).subscribe({
      next: (categorias) => {
        this.categoriasSeleccionadas = categorias;
        console.log('Categorías ya agregadas al hogar:', this.categoriasSeleccionadas);
      },
      error: (error) => {
        console.error('Error al cargar categorías seleccionadas:', error);
      }
    });
  }

//
// // FUNCIONES PARA GESTIONARR RESIDENTES
//
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


//
// // CONTROL DE ERRORES
//
    getMensajeError(controlName: string): string {
    if (this.error === 1) {
      const control = this.crearCategoriaForm.get(controlName);
        if (control?.errors && (control.touched || this.submitted)) {
        if (control.errors['required']) return 'Este campo es obligatorio';
      } 
    } else if (this.error === 2){
      const control = this.crearTicketForm.get(controlName);
      if (control?.errors && (control.touched || this.submitted)) {
        if (control.errors['required']) return 'Este campo es obligatorio';
        if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
        if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
        if (control.errors['min']) { return `El monto debe ser mayor a 0`; }
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

  //
  // // FUNCION PARA GENERAR PDF
  //
  generarPDF() {
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

    // Fecha actual
    const fecha = new Date();
    const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

    // Título principal
    doc.setTextColor(173, 216, 230);
    doc.setFontSize(26);
    doc.text('Reporte Individual de hogar', 60, 70);

    // Línea
    doc.setDrawColor(173, 216, 230);
    doc.line(60, 80, 500, 80);

    // Datos generales
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fechaStr}`, 60, 100);
    doc.text('Responsable: Colio Ochoa', 60, 120);

    // Resumen Ejecutivo
    doc.setTextColor(100, 180, 255);
    doc.setFontSize(14);
    doc.text('Resumen del reporte', 60, 150);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Reporte generado desde el portal. Cualquier duda consultarlo con su administrador de hogar.', 60, 170);

    // --- Categoría: Renta ---
    let y = 200;
    doc.setTextColor(100, 180, 255);
    doc.setFontSize(14);
    doc.text('Categoría: Renta', 60, y);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Descripción:', 60, y + 20);
    doc.text('Renta del hogar', 130, y + 20);

    autoTable(doc, {
      startY: y + 35,
      head: [['#', 'Costo', 'Descripción', 'Comentarios']],
      body: [
        ['1', '1500', 'Renta mensual', 'Que caro'],
      ],
      styles: {
        fillColor: [255, 255, 255],
        textColor: [60, 60, 60],
        lineColor: [60, 60, 60],
        halign: 'center'
      },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 100, 100],
        fontStyle: 'bold'
      },
      margin: { left: 60, right: 60 }
    });

    y = (doc as any).lastAutoTable.finalY + 30;
    doc.setTextColor(100, 180, 255);
    doc.setFontSize(14);
    doc.text('Categoría: Servicios', 60, y);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Descripción:', 60, y + 20);
    doc.text('Servicios de streaming', 130, y + 20);

    autoTable(doc, {
      startY: y + 35,
      head: [['#', 'Costo', 'Descripción', 'Comentarios']],
      body: [
        ['1', '50', 'neflis', 'uwu'],
        ['2', '50', 'prime', '7w7'],
      ],
      styles: {
        fillColor: [255, 255, 255],
        textColor: [60, 60, 60],
        lineColor: [60, 60, 60],
        halign: 'center'
      },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 100, 100],
        fontStyle: 'bold'
      },
      margin: { left: 60, right: 60 }
    });
   // --- Categoría: Servicios importantes ---
    y = (doc as any).lastAutoTable.finalY + 30;
    doc.setTextColor(100, 180, 255);
    doc.setFontSize(14);
    doc.text('Categoría: Servicios importantes', 60, y);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Descripción:', 60, y + 20);
    doc.text('Servicios de agua,luz,gas', 130, y + 20);

    autoTable(doc, {
      startY: y + 35,
      head: [['#', 'Costo', 'Descripción', 'Comentarios']],
      body: [
        ['1', '200', 'luz', 'uwu'],
        ['2', '50', 'agua', '7w7'],
        ['3', '70', 'gas', '7w7'],
      ],
      styles: {
        fillColor: [255, 255, 255],
        textColor: [60, 60, 60],
        lineColor: [60, 60, 60],
        halign: 'center'
      },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 100, 100],
        fontStyle: 'bold'
      },
      margin: { left: 60, right: 60 }
    });

    doc.save('reporte-individual.pdf');
  }
  generarPDFgrupal() {
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

    // Fecha actual
    const fecha = new Date();
    const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

    // Título principal
    doc.setTextColor(173, 216, 230);
    doc.setFontSize(26);
    doc.text('Reporte Individual de hogar', 60, 70);

    // Línea
    doc.setDrawColor(173, 216, 230);
    doc.line(60, 80, 500, 80);

    // Datos generales
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fechaStr}`, 60, 100);
    doc.text('Responsable: admin', 60, 120);

    // Resumen Ejecutivo
    doc.setTextColor(100, 180, 255);
    doc.setFontSize(14);
    doc.text('Resumen del reporte', 60, 150);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Reporte generado desde el portal. Cualquier duda consultarlo con su administrador de hogar.', 60, 170);

    // --- Categoría: Renta ---
    let y = 200;
    doc.setTextColor(100, 180, 255);
    doc.setFontSize(14);
    doc.text('Categoría: Renta', 60, y);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Descripción:', 60, y + 20);
    doc.text('Renta del hogar', 130, y + 20);

    autoTable(doc, {
      startY: y + 35,
      head: [['usuario', '#', 'Costo', 'Descripción', 'Comentarios']],
      body: [
        ['colio','1', '1500', 'Renta mensual', 'Que caro'],
      ],
      styles: {
        fillColor: [255, 255, 255],
        textColor: [60, 60, 60],
        lineColor: [60, 60, 60],
        halign: 'center'
      },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 100, 100],
        fontStyle: 'bold'
      },
      margin: { left: 60, right: 60 }
    });

    // --- Categoría: Servicios ---
    y = (doc as any).lastAutoTable.finalY + 30;
    doc.setTextColor(100, 180, 255);
    doc.setFontSize(14);
    doc.text('Categoría: Servicios', 60, y);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Descripción:', 60, y + 20);
    doc.text('Servicios de streaming', 130, y + 20);

    autoTable(doc, {
      startY: y + 35,
      head: [['usuario', '#', 'Costo', 'Descripción', 'Comentarios']],
      body: [
        ['colio','1', '50', 'neflis', 'uwu'],
        ['colio','2', '50', 'prime', '7w7'],
      ],
      styles: {
        fillColor: [255, 255, 255],
        textColor: [60, 60, 60],
        lineColor: [60, 60, 60],
        halign: 'center'
      },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 100, 100],
        fontStyle: 'bold'
      },
      margin: { left: 60, right: 60 }
    });
   // --- Categoría: Servicios importantes ---
    y = (doc as any).lastAutoTable.finalY + 30;
    doc.setTextColor(100, 180, 255);
    doc.setFontSize(14);
    doc.text('Categoría: Servicios importantes', 60, y);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Descripción:', 60, y + 20);
    doc.text('Servicios de agua,luz,gas', 130, y + 20);

    autoTable(doc, {
      startY: y + 35,
      head: [['colio','#', 'Costo', 'Descripción', 'Comentarios']],
      body: [
        ['colio','1', '200', 'luz', 'uwu'],
        ['colio','2', '50', 'agua', '7w7'],
        ['colio','3', '70', 'gas', '7w7'],
      ],
      styles: {
        fillColor: [255, 255, 255],
        textColor: [60, 60, 60],
        lineColor: [60, 60, 60],
        halign: 'center'
      },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 100, 100],
        fontStyle: 'bold'
      },
      margin: { left: 60, right: 60 }
    });

    doc.save('reporte-grupal.pdf');
  }
}

