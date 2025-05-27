import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRouter, routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

const token = sessionStorage.getItem('token');

const protectedRoutes = ['/bienvenida']; 

if(!token && protectedRoutes.includes(location.pathname)){
    location.href = '/login';
} else {
  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(ReactiveFormsModule),
      provideHttpClient(),
      provideRouter(routes)
  ]
  }).catch(err => console.error(err));
}
