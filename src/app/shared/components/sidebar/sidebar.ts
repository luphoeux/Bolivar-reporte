import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FeatherIcons } from '../feather-icons/feather-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FeatherIcons],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class Sidebar {
  public menuItems: any[] = [
    {
      title: 'GENERAL',
      type: 'title'
    },
    {
      title: 'Mi Cuenta',
      icon: 'home',
      type: 'link',
      path: '/mi-cuenta',
      active: false
    },
    {
      title: 'ORGANIZACIÓN',
      type: 'title'
    },
    {
      title: 'Usuarios',
      icon: 'users',
      type: 'link',
      path: '/usuarios',
      active: false
    },
    {
      title: 'Clientes',
      icon: 'users',
      type: 'link',
      path: '/clientes',
      active: false
    },
    {
      title: 'Perfiles',
      icon: 'user',
      type: 'link',
      path: '/perfiles',
      active: false
    },
    {
      title: 'Agencias',
      icon: 'bookmark',
      type: 'link',
      path: '/agencias',
      active: false
    },
    {
      title: 'SUSCRIPCIONES',
      type: 'title'
    },
    {
      title: 'Socios',
      icon: 'briefcase',
      type: 'sub',
      active: false,
      children: [
        { title: 'Socios', type: 'link', path: '/socios' },
        { title: 'Comisiones Socios', type: 'link', path: '/socios/comisiones' }
      ]
    },
    {
      title: 'Abonos',
      icon: 'bookmark',
      type: 'sub',
      active: false,
      children: [
        { title: 'Abonos', type: 'link', path: '/abonos' },
        { title: 'Comisiones Abonos', type: 'link', path: '/abonos/comisiones' }
      ]
    },
    {
      title: 'Gestión De Suscripciones',
      icon: 'folder',
      type: 'link',
      path: '/gestion-suscripciones',
      active: false
    },
    {
      title: 'Estadio Tembladerani',
      icon: 'grid',
      type: 'link',
      path: '/estadio-tembladerani',
      active: false
    },
    {
      title: 'Reportes',
      icon: 'file-text',
      type: 'sub',
      active: true, // Active by default for memberships
      children: [
        { title: 'De Membresías', type: 'link', path: '/reportes/membresias' }
      ]
    },
    {
      title: 'TICKETS',
      type: 'title'
    },
    {
      title: 'Eventos Tickets',
      icon: 'tag',
      type: 'sub',
      active: false,
      children: [
        { title: 'Categorias', type: 'link', path: '/eventos-tickets/categorias' },
        { title: 'Eventos Actuales', type: 'link', path: '/eventos-tickets/actuales' },
        { title: 'Tipos', type: 'link', path: '/eventos-tickets/tipos' }
      ]
    },
    {
      title: 'Reportes',
      icon: 'file-text',
      type: 'sub',
      active: false,
      children: [
        { title: 'De Entradas', type: 'link', path: '/tickets/reporte-entradas' },
        { title: 'De Asistencia', type: 'link', path: '/tickets/reporte-asistencia' }
      ]
    }
  ];

  toggleMenu(item: any) {
    if (item.type === 'sub') {
      // Close all other menus
      this.menuItems.forEach(menuItem => {
        if (menuItem.type === 'sub' && menuItem !== item) {
          menuItem.active = false;
        }
      });
      // Toggle the clicked menu
      item.active = !item.active;
    }
  }
}
