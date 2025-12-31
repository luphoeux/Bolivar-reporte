import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeatherIcons } from '../../shared/components/feather-icons/feather-icons';
import { MembersService } from '../../core/services/members.service';
import { ExcelService } from '../../core/services/excel.service';

@Component({
  selector: 'app-reportes-membresias',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, FeatherIcons],
  templateUrl: './reportes-membresias.html',
  styleUrls: ['./reportes-membresias.scss']
})
export class ReportesMembresias implements OnInit {
  members: any[] = [];
  filteredMembers: any[] = [];
  displayedMembers: any[] = [];
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 30;
  totalPages: number = 1;
  
  // Pagination State Properties
  startIndex = 0;
  endIndex = 0;
  pageNumbers: number[] = [];
  
  // UX State
  isLoading = true;
  showDetailModal = false;
  selectedMember: any = null;
  paymentBreakdown: { label: string; value: number }[] = [];

  stats: any[] = [
    {
      title: 'Membresías Pagadas',
      icon: 'trending-up',
      color: 'success',
      items: [
        { label: 'Total Membresías', value: '0' },
        { label: 'Total Ventas', value: '0' },
        { label: 'Monto Total', value: '0 Bs', isHighlight: true },
        { label: 'Service Fee', value: '0 Bs' }
      ]
    },
    {
      title: 'Socio Dorado',
      icon: 'award',
      color: 'warning',
      items: [
        { label: 'Total Membresías', value: '0' },
        { label: 'Total Ventas', value: '0' },
        { label: 'Monto Total', value: '0 Bs', isHighlight: true }
      ]
    },
    {
      title: 'Socio Celeste',
      icon: 'star',
      color: 'info',
      items: [
        { label: 'Total Membresías', value: '0' },
        { label: 'Total Ventas', value: '0' },
        { label: 'Monto Total', value: '0 Bs', isHighlight: true }
      ]
    },
    {
      title: 'Socio Platino',
      icon: 'shield',
      color: 'primary',
      items: [
        { label: 'Total Membresías', value: '0' },
        { label: 'Total Ventas', value: '0' },
        { label: 'Monto Total', value: '0 Bs', isHighlight: true }
      ]
    }
  ];
  
  // Filters State
  filterData = {
    evento: null,
    ci: '',
    email: '',
    tipoReserva: null,
    antiguedad: null,
    canalVenta: null,
    soloConSaldo: false
  };

  // Filter Options
  uniqueEvents: any[] = []; // Mapped to Gestion
  uniqueTypes: any[] = []; // Mapped to Categoria
  uniqueAntiguedad: any[] = []; // Mapped to Antigüedad
  uniqueChannels: any[] = []; // Mapped to Vendedor

  constructor(
    private membersService: MembersService,
    private excelService: ExcelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    console.log('=== STARTING DATA LOAD ===');
    
    this.membersService.getMembers().subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data && Array.isArray(data) && data.length > 0) {
          this.members = data;
          this.filteredMembers = data;
          
          this.populateFilterOptions();
          this.calculateStats();
          this.updatePagination();
          
          this.cdr.detectChanges();
          
          console.log('=== DATA LOADED AND VIEW UPDATED ===');
          
        } else {
          console.warn('=== NO VALID DATA ===');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error:', err);
        alert('Error al cargar datos');
      }
    });
  }

  populateFilterOptions() {
    // Unique Gestiones
    this.uniqueEvents = [...new Set(this.members.map(m => m['Gestión']).filter(x => x))].sort();

    // Unique Categories
    this.uniqueTypes = [...new Set(this.members.map(m => m['Categoría']).filter(x => x))].sort();
    
    // Unique Antigüedad
    this.uniqueAntiguedad = [...new Set(this.members.map(m => m['Antigüedad']).filter(x => x))].sort();
    
    // Unique Vendedores
    this.uniqueChannels = [...new Set(this.members.map(m => m.Vendedor).filter(x => x))].sort();
  }

  calculateStats() {
    const total = this.filteredMembers.length;
    const totalAmount = this.filteredMembers.reduce((acc, curr) => acc + (curr['Total Ingreso'] || 0), 0);
    
    // Calculate by category
    const dorado = this.filteredMembers.filter(m => m['Categoría'] === 'Socio Dorado');
    const celeste = this.filteredMembers.filter(m => m['Categoría'] === 'Socio Celeste');
    const platino = this.filteredMembers.filter(m => m['Categoría'] === 'Socio Platino');
    
    const doradoAmount = dorado.reduce((acc, curr) => acc + (curr['Total Ingreso'] || 0), 0);
    const celesteAmount = celeste.reduce((acc, curr) => acc + (curr['Total Ingreso'] || 0), 0);
    const platinoAmount = platino.reduce((acc, curr) => acc + (curr['Total Ingreso'] || 0), 0);

    // Update KPIs
    this.stats[0].items[0].value = total.toLocaleString();
    this.stats[0].items[1].value = total.toLocaleString();
    this.stats[0].items[2].value = `${totalAmount.toLocaleString()} Bs`;
    this.stats[0].items[3].value = '0 Bs'; 

    this.stats[1].items[0].value = dorado.length.toLocaleString();
    this.stats[1].items[1].value = dorado.length.toLocaleString();
    this.stats[1].items[2].value = `${doradoAmount.toLocaleString()} Bs`;

    this.stats[2].items[0].value = celeste.length.toLocaleString();
    this.stats[2].items[1].value = celeste.length.toLocaleString();
    this.stats[2].items[2].value = `${celesteAmount.toLocaleString()} Bs`;

    this.stats[3].items[0].value = platino.length.toLocaleString();
    this.stats[3].items[1].value = platino.length.toLocaleString();
    this.stats[3].items[2].value = `${platinoAmount.toLocaleString()} Bs`;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredMembers.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedMembers = this.filteredMembers.slice(startIndex, endIndex);
    
    this.startIndex = this.filteredMembers.length > 0 ? startIndex + 1 : 0;
    this.endIndex = Math.min(endIndex, this.filteredMembers.length);
    this.generatePageNumbers();
  }

  applyFilters() {
    this.filteredMembers = this.members.filter(m => {
      let match = true;
      
      // Filter by CI
      if (this.filterData.ci && !String(m.CI || '').toLowerCase().includes(this.filterData.ci.toLowerCase())) {
        match = false;
      }

      // Filter by Name/Surname
      const searchName = this.filterData.email?.toLowerCase();
      if (searchName) {
        const fullName = `${m.Nombre || ''} ${m.Apellidos || ''}`.toLowerCase();
        if (!fullName.includes(searchName)) {
           match = false;
        }
      }

      // Filter by Categoria
      if (this.filterData.tipoReserva && m['Categoría'] !== this.filterData.tipoReserva) {
        match = false;
      }

      // Filter by Antigüedad
      if (this.filterData.antiguedad && m['Antigüedad'] !== this.filterData.antiguedad) {
        match = false;
      }

      // Filter by Vendedor
      if (this.filterData.canalVenta && m.Vendedor !== this.filterData.canalVenta) {
        match = false;
      }
      
      // Filter by Gestion
      if (this.filterData.evento && String(m['Gestión']) !== String(this.filterData.evento)) {
          match = false;
      }

      // Filter by Saldo (Deuda)
      if (this.filterData.soloConSaldo && (m.Saldo || 0) <= 0) {
        match = false;
      }

      return match;
    });
    
    this.currentPage = 1; // Reset to first page
    this.calculateStats();
    this.updatePagination();
  }

  getCategoryClass(category: string): string {
    const cat = (category || '').toLowerCase();
    
    if (cat.includes('dorado')) {
      return 'badge-dorado';
    } else if (cat.includes('celeste')) {
      return 'badge-celeste';
    } else if (cat.includes('platino')) {
      return 'badge-platino';
    }
    
    return 'badge-light';
  }

  clearFilters() {
    this.filterData = {
      evento: null,
      ci: '',
      email: '',
      tipoReserva: null,
      antiguedad: null,
      canalVenta: null,
      soloConSaldo: false
    };
    this.filteredMembers = this.members;
    this.currentPage = 1;
    this.calculateStats();
    this.updatePagination();
  }

  generatePageNumbers() {
    this.pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pageNumbers.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) this.pageNumbers.push(i);
        this.pageNumbers.push(-1); // Separator
        this.pageNumbers.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        this.pageNumbers.push(1);
        this.pageNumbers.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) this.pageNumbers.push(i);
      } else {
        this.pageNumbers.push(1);
        this.pageNumbers.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) this.pageNumbers.push(i);
        this.pageNumbers.push(-1);
        this.pageNumbers.push(this.totalPages);
      }
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  exportExcel() {
    console.log('Exporting to Excel...');
    // Add logic here if needed
  }



  // Modal Logic
  openDetailModal(member: any) {
    this.selectedMember = member;
    this.paymentBreakdown = this.getPaymentBreakdown(member);
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedMember = null;
    this.paymentBreakdown = [];
  }

  getPaymentBreakdown(member: any): { label: string; value: number }[] {
    const breakdown: { label: string; value: number }[] = [];
    
    // Check Initial Quota
    if (member['Cuota inicial'] > 0) {
      breakdown.push({ label: 'Cuota Inicial', value: member['Cuota inicial'] });
    }

    // Check Enrollments/Upgrades
    if (member['Cuota upgrade'] > 0) {
      breakdown.push({ label: 'Cuota Upgrade', value: member['Cuota upgrade'] });
    }

    // Check Monthly Quotas 2-10 (Cuota 1 is typically same as Initial)
    for (let i = 2; i <= 10; i++) {
        const key = `Cuota ${i}`;
        if (member[key] > 0) {
            breakdown.push({ label: key, value: member[key] });
        }
    }
    
    return breakdown;
  }
}
