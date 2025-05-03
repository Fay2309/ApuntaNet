import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { LoginComponent } from './app/login/login.component';
import { RegistroComponent } from './app/registro/registro.component';
import { BienvenidaComponent } from '@app/bienvenida/bienvenida.component';
import { PruebaComponent } from '@app/prueba/prueba.component';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(ReactiveFormsModule),
    provideHttpClient(),
    provideRouter([
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'registro', component: RegistroComponent },
      { path: 'bienvenida', component: BienvenidaComponent },
      { path: 'prueba', component: PruebaComponent }
    ])
  ]
}).catch(err => console.error(err));
