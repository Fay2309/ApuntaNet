import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

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

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', [
        Validators.required,
      ]],
    }, {  });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Datos del formulario:', this.loginForm.value);
      this.router.navigate(['/login']); //CAMBIO AQUÍ A LA PESTAÑA QUE SIGUE
    } else {
      console.log('Formulario inválido');
    }
  }
  
}
