import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent { 
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', [
        Validators.required,
      ]],
    }, {  });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { usuario, password } = this.loginForm.value;

      this.authService.login(usuario, password).subscribe({
        next: (respuesta) => {
          console.log('Login exitoso:', respuesta);
          this.router.navigate(['/bienvenida']); // AQUI EL CAMBIO DE PÁGINA
        },
        error: (err) => {
          console.error('Login fallido:', err);
          alert('Usuario o contraseña incorrectos');
        }
      });
    }
  } 
}
