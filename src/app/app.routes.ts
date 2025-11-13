import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component'
import { BienvenidaComponent } from './bienvenida/bienvenida.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { GestionarhogarComponent } from './gestionarhogar/gestionarhogar.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: 'landingpage', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'bienvenida', component: BienvenidaComponent, canActivate: [AuthGuard] },
    { path: 'landingpage', component: LandingpageComponent },
    { path: 'gestionarhogar', component: GestionarhogarComponent },
];

export const appRouter = provideRouter(routes);