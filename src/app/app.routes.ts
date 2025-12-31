import { Routes } from '@angular/router';
import { ReportesMembresias } from './features/reportes/reportes-membresias';
import { PlaceholderPage } from './shared/components/placeholder/placeholder';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'reportes/membresias',
    pathMatch: 'full'
  },
  {
    path: 'reportes/membresias',
    component: ReportesMembresias
  },
  {
    path: 'tickets/reportes',
    component: PlaceholderPage
  },
  {
    path: 'tickets/reporte-entradas',
    component: PlaceholderPage
  },
  // Placeholder routes for other sections
  {
    path: 'mi-cuenta',
    component: PlaceholderPage
  },
  {
    path: 'usuarios',
    component: PlaceholderPage
  },
  {
    path: 'clientes',
    component: PlaceholderPage
  },
  {
    path: 'perfiles',
    component: PlaceholderPage
  },
  {
    path: 'agencias',
    component: PlaceholderPage
  },
  {
    path: 'socios',
    component: PlaceholderPage
  },
  {
    path: 'socios/comisiones',
    component: PlaceholderPage
  },
  {
    path: 'abonos',
    component: PlaceholderPage
  },
  {
    path: 'abonos/comisiones',
    component: PlaceholderPage
  },
  {
    path: 'gestion-suscripciones',
    component: PlaceholderPage
  },
  {
    path: 'estadio-tembladerani',
    component: PlaceholderPage
  },
  {
    path: 'eventos-tickets/categorias',
    component: PlaceholderPage
  },
  {
    path: 'eventos-tickets/actuales',
    component: PlaceholderPage
  },
  {
    path: 'eventos-tickets/tipos',
    component: PlaceholderPage
  },
  {
    path: 'tickets/reporte-asistencia',
    component: PlaceholderPage
  },
  {
    path: '**',
    redirectTo: 'reportes/membresias'
  }
];
