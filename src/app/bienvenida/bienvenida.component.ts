import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom, timeout, catchError, of} from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HogarService } from '../services/hogar.service';
import { unirseHogarService } from '@app/services/unirseHogar.service';
import { RespuestaHogar } from '../bienvenida/bienvenida.interface';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BienvenidaComponent implements OnInit {
  public nombreUsuario: string = '';
  public menuVisible: boolean = false;
  public usuarioId: number = 0;
  public modalVisible: number = 0;
  public error: number = 0;
  public crearHogarForm: FormGroup;
  public ingresarHogarForm: FormGroup;
  public submitted: boolean = false;
  esCreador: boolean = false;
  nombreHogar: string | null = null;
  codigoHogar: string | null = null;

  isLoading: boolean = true;
  datosUsuarioCargados: boolean = false;

  constructor(private authService: AuthService, 
    private router: Router, 
    private elementRef: ElementRef, 
    private cdr: ChangeDetectorRef,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private hogarService: HogarService,
    private unirseHogarService: unirseHogarService
  ) {
    this.crearHogarForm = this.fb.group({
      nombreHogar: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]]
    });
    this.ingresarHogarForm = this.fb.group({
      codigoHogar: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  // -------------------------------------------------------------------------------------------------------
  
async ngOnInit(): Promise<void> {
  try {
    this.isLoading = true;
    
    const usuario = this.authService.obtenerUsuarioActual();
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      throw new Error('No se encontró el token en sessionStorage');
    }

    this.nombreUsuario = usuario?.nombre ?? 'Usuario';
    this.usuarioId = usuario?.id ?? 0;

    
    const respuesta = await firstValueFrom(this.hogarService.obtenerHogarActual(token));
    
    if (respuesta.hogares && respuesta.hogares.length > 0) {
      const hogar = respuesta.hogares[0];
      this.nombreHogar = hogar.nombre;
      this.esCreador = hogar.es_creador;
      this.codigoHogar = hogar.codigo;
      console.log('¿Es creador?:', this.esCreador);
      console.log('Hogar recibido:', respuesta);
    } else {
      this.nombreHogar = null;
      this.esCreador = false;
      console.log('El usuario no pertenece a ningún hogar.');
    }

    this.datosUsuarioCargados = true;
    this.cdRef.markForCheck()
    
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    this.isLoading = false;
  }
}
/////
/* //
    POR ALGUNA RAZÓN ESTO FUNCIONA, NO TOCAR ALV 
*/ //
/////
ngAfterViewInit(): void {
  setTimeout(() => {
    this.cargarDatosIniciales();
  }, 0);
}

private async cargarDatosIniciales(): Promise<void> {
  try {
    this.isLoading = true;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    this.isLoading = false;
    this.cdRef.markForCheck();
  }
}
/////
/* //
    POR ALGUNA RAZÓN ESTO FUNCIONA, NO TOCAR ALV 
*/ //
/////

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  logout(): void {
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']); 
  }

// -------------------------------------------------------------------------------------------------------

  mostrarModalCrear(): void {
    this.modalVisible = 1;
    this.error = 1;
    this.submitted = false;
    this.crearHogarForm.reset();
    this.cdr.detectChanges();
  }

  mostrarModalIngresar(): void {
    this.modalVisible = 2;
    this.error = 2;
    this.submitted = false;
    this.ingresarHogarForm.reset();
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.modalVisible = 0;
    this.cdr.detectChanges();
  }

crearHogar(): void {
  this.submitted = true;

  if (this.crearHogarForm.valid) {
    const datos = {
      accion: 'crear',
      nombre_hogar: this.crearHogarForm.value.nombreHogar,
      descripcion_hogar: this.crearHogarForm.value.descripcion,
      id_usuario: this.usuarioId
    };

    this.hogarService.crearHogar(datos).subscribe({
      next: (respuesta) => {
        console.log('Respuesta del servidor:', respuesta);
        this.cerrarModal();
        window.location.reload();
      },
      error: (error) => {
        if (error.status === 400 && error.error.message) {
          alert(error.error.message); // Muestra el mensaje del backend
        } else {
          console.error('Error al crear hogar:', error);
        }
      }
    });
  } else {
    Object.keys(this.crearHogarForm.controls).forEach(key => {
      this.crearHogarForm.get(key)?.markAsTouched();
    });
    this.cdr.detectChanges();
  }
}

ingresarHogar(): void {
  this.submitted = true;

  if (this.ingresarHogarForm.valid) {
    const token = sessionStorage.getItem('token');  
    const datos = {
      accion: 'unirse',
      codigo: this.ingresarHogarForm.value.codigoHogar,
      token: `Bearer ${token}`
    };

    this.unirseHogarService.unirseHogar(datos).subscribe({
      next: (respuesta) => {
        console.log('Ingreso exitoso al hogar:', respuesta);
        this.cerrarModal();
        window.location.reload();
      },
      error: (error) => {
        if (error.status === 400 && error.error.message) {
          alert(error.error.message);
        } else {
          console.error('Error al ingresar al hogar:', error);
        }
      }
    });
  } else {
    Object.keys(this.ingresarHogarForm.controls).forEach(key => {
      this.ingresarHogarForm.get(key)?.markAsTouched();
    });
    this.cdr.detectChanges();
  }
}

salirseOHogar() {
  const token = this.authService.getToken();
  if (!token) return;

  if (this.esCreador) {
    if (confirm("Eres el creador. ¿Deseas disolver el hogar?")) {
      this.hogarService.salirseDelHogar(token).subscribe({
        next: (res: any) => {
          alert(res.message);
          window.location.reload();
        },
        error: (err) => alert(err.error.message)
      });
    }
  } else {
    if (confirm("¿Seguro que quieres salir del hogar?")) {
      this.hogarService.salirseDelHogar(token).subscribe({
        next: (res: any) => {
          alert(res.message);
          window.location.reload();
        },
        error: (err) => alert(err.error.message)
      });
    }
  }
}

  getMensajeError(controlName: string): string {
    if (this.error == 1) {
      const control = this.crearHogarForm.get(controlName);
      if (control?.errors && (control.touched || this.submitted)) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      } 
    }
    else if (this.error == 2) {
      const control = this.ingresarHogarForm.get(controlName);
      if (control?.errors && (control.touched || this.submitted)) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['minlength']) return 'Se necesitan al menos 6 caracteres, debe incluir letras y números';  
      if (control.errors['maxlength']) return 'Máximo 6 caracteres, debe incluir letras y números';
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
