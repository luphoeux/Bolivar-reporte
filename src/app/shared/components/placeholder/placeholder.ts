import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <i class="fa fa-info-circle placeholder-icon"></i>
        <h3>Página en construcción</h3>
        <p>Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .placeholder-content {
      text-align: center;
      color: #64748b;
    }

    .placeholder-icon {
      font-size: 64px;
      color: #cbd5e1;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 10px;
    }

    p {
      font-size: 16px;
      color: #64748b;
    }
  `]
})
export class PlaceholderPage {}
