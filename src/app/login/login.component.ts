import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
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
          this.router.navigate(['/bienvenida']); 
        },
        error: (err) => {
          console.error('Login fallido:', err);
          alert('Usuario o contraseña incorrectos');
        }
      });
    }
  } 
}
