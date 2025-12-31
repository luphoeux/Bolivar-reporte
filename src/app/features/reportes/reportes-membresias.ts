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
  showFilterSuccess = false;
  selectedMember: any = null;
  paymentBreakdown: { label: string; value: number }[] = [];

  stats: any[] = [
    {
      title: 'Membresías Pagadas',
      icon: 'trending-up',
      color: 'success',
      items: [
        { label: 'Total Membresías', value: '0' },
        { label: 'Total Ventas', value: '0' }
      ]
    },
    {
      title: 'Métodos de Pago',
      icon: 'credit-card',
      color: 'info',
      items: [
        { label: 'Caja/Efectivo', value: '0' },
        { label: 'Link de pago', value: '0' },
        { label: 'Pago con Tarjeta', value: '0' },
        { label: 'Pago con QR', value: '0' }
      ]
    },
    {
      title: 'Ejecutivos de Ventas',
      icon: 'users',
      color: 'success',
      items: [
        { label: 'Adriana', value: '0 Bs' },
        { label: 'Enrique', value: '0 Bs' },
        { label: 'Steph', value: '0 Bs' },
        { label: 'Sergio', value: '0 Bs' }
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
  filterData: any = {
    evento: 2025,
    ci: '',
    email: '',
    tipoReserva: null,
    antiguedad: null,
    canalVenta: null,
    soloConSaldo: false,
    producto: null,
    startDate: null,
    endDate: null
  };

  // Filter Options
  uniqueEvents: any[] = []; // Mapped to Gestion
  uniqueTypes: any[] = []; // Mapped to Categoria
  uniqueAntiguedad: any[] = []; // Mapped to Antigüedad
  uniqueChannels: any[] = []; // Mapped to Vendedor
  uniqueProducts: any[] = []; // Mapped to Producto

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
    
    // Set default filter to 2025 if available, otherwise first available year
    if (!this.filterData.evento) {
        this.filterData.evento = this.uniqueEvents.includes(2025) ? 2025 : (this.uniqueEvents[0] || null);
        // Apply initial filter filtering effectively by year immediately
        this.applyFilters(); 
    }

    // Unique Categories - Initial population
    this.updateCategoryList();
    
    // Unique Antigüedad
    this.uniqueAntiguedad = [...new Set(this.members.map(m => m['Antigüedad']).filter(x => x))].sort();
    
    // Unique Vendedores - Dependent on CURRENT filtered data (which includes year filter)
    // We use 'this.filteredMembers' instead of 'this.members' if we want it to react to the year changes,
    // BUT 'populateFilterOptions' is usually called once. 
    // To make it dynamic, we should probably update the executive list whenever filters change,
    // OR just base this initial population on the default year we just set.
    
    // Let's gather executives from the members that match the default/current year
    const currentYearMembers = this.members.filter(m => String(m['Gestión']) === String(this.filterData.evento));
    
    this.uniqueChannels = [...new Set(currentYearMembers.map(m => m.Vendedor).filter(x => x))].sort();

    // Unique Membership Types
    this.uniqueProducts = ['Sociedades', 'Abonos', 'Combos'];
  }

  updateExecutiveList() {
    // Determine the year to usage (filterData.evento or no filter)
    // If filterData.evento is null, we might want to show ALL executives across all years, 
    // or keep the last filtered list. Let's assume matches current year selection.
    
    let membersToConsider = this.members;
    if (this.filterData.evento) {
        membersToConsider = this.members.filter(m => String(m['Gestión']) === String(this.filterData.evento));
    }

    this.uniqueChannels = [...new Set(membersToConsider.map(m => m.Vendedor).filter(x => x))].sort();
    
    // Clear selected executive if they are no longer in the list
    if (this.filterData.canalVenta && !this.uniqueChannels.includes(this.filterData.canalVenta)) {
        this.filterData.canalVenta = null;
    }
  }

  updateCategoryList() {
      // 1. Filter by Year first
      let consideredMembers = this.members;
      if (this.filterData.evento) {
          consideredMembers = this.members.filter(m => String(m['Gestión']) === String(this.filterData.evento));
      }

      // 2. Filter by Product (Membresía) if selected
      if (this.filterData.producto) {
          const selected = this.filterData.producto;
          consideredMembers = consideredMembers.filter(m => {
              const productLower = (m.Producto || '').toLowerCase();
              if (selected === 'Combos') {
                  return productLower.includes('combo');
              } else if (selected === 'Abonos') {
                  return productLower.includes('abono') && !productLower.includes('combo');
              } else { // Sociedades
                  return !productLower.includes('abono') && !productLower.includes('combo');
              }
          }); 
      }

      // 3. Extract Unique Categories
      this.uniqueTypes = [...new Set(consideredMembers.map(m => m['Categoría']).filter(x => x))].sort();

      // Clear selected category if it's no longer valid
      if (this.filterData.tipoReserva && !this.uniqueTypes.includes(this.filterData.tipoReserva)) {
          this.filterData.tipoReserva = null;
      }
  }


  calculateStats() {
    const total = this.filteredMembers.length;
    const totalAmount = this.filteredMembers.reduce((acc, curr) => acc + (curr['Total Ingreso'] || 0), 0);
    
    // Calculate counts for Socios vs Abonos
    const abonosCount = this.filteredMembers.filter(m => (m.Producto || '').toLowerCase().includes('abono')).length;
    const sociosCount = total - abonosCount;

    // Calculate by category
    const dorado = this.filteredMembers.filter(m => m['Categoría'] === 'Socio Dorado');
    const celeste = this.filteredMembers.filter(m => m['Categoría'] === 'Socio Celeste');
    const platino = this.filteredMembers.filter(m => m['Categoría'] === 'Socio Platino');
    
    const doradoAmount = dorado.reduce((acc, curr) => acc + (curr['Total Ingreso'] || 0), 0);
    const celesteAmount = celeste.reduce((acc, curr) => acc + (curr['Total Ingreso'] || 0), 0);
    const platinoAmount = platino.reduce((acc, curr) => acc + (curr['Total Ingreso'] || 0), 0);

    // Update KPIs
    // Card 1: Membresías Pagadas (Counts only)
    this.stats[0].items[0].label = 'Sociedades';
    this.stats[0].items[0].value = sociosCount.toLocaleString();
    
    this.stats[0].items[1].label = 'Abonos';
    this.stats[0].items[1].value = abonosCount.toLocaleString();

    // this.stats[0].items[2].value = `${totalAmount.toLocaleString()} Bs`; // Removed as per request 

    // Card 2: Métodos de Pago
    const qrs = this.filteredMembers.filter(m => {
        const method = (m['Método de Pago'] || m['Forma de Pago'] || m['Tipo de Pago'] || '').toLowerCase();
        return method.includes('qr');
    }).length;
    
    const cards = this.filteredMembers.filter(m => {
        const method = (m['Método de Pago'] || m['Forma de Pago'] || m['Tipo de Pago'] || '').toLowerCase();
        return method.includes('tarjeta');
    }).length;
    
    const links = this.filteredMembers.filter(m => {
        const method = (m['Método de Pago'] || m['Forma de Pago'] || m['Tipo de Pago'] || '').toLowerCase();
        return method.includes('link');
    }).length;
    
    const cash = this.filteredMembers.filter(m => {
        const method = (m['Método de Pago'] || m['Forma de Pago'] || m['Tipo de Pago'] || '').toLowerCase();
        return method.includes('efectivo') || method.includes('caja');
    }).length;

    this.stats[1].title = 'Métodos de Pago';
    this.stats[1].icon = 'credit-card';
    this.stats[1].color = 'info';
    this.stats[1].items = [
        { label: 'Caja/Efectivo', value: cash.toLocaleString() },
        { label: 'Link de pago', value: links.toLocaleString() },
        { label: 'Pago con Tarjeta', value: cards.toLocaleString() },
        { label: 'Pago con QR', value: qrs.toLocaleString() }
    ];

    // Card 3: Ejecutivos de Ventas (Dynamic Top 4)
    // Group by Vendedor and sum Total Ingreso
    const vendorStats: { [key: string]: number } = {};
    
    this.filteredMembers.forEach(m => {
        const vendor = m.Vendedor || 'Sin Asignar';
        const income = m['Total Ingreso'] || 0;
        vendorStats[vendor] = (vendorStats[vendor] || 0) + income;
    });

    // Convert to array and sort by income descending
    const sortedVendors = Object.keys(vendorStats)
        .map(key => ({ label: key, value: vendorStats[key] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4); // Take top 4

    this.stats[2].title = 'Ejecutivos de Ventas';
    this.stats[2].icon = 'users'; 
    this.stats[2].color = 'success';
    
    // Map to stats items, ensure we have at least empty state if no data
    if (sortedVendors.length > 0) {
        this.stats[2].items = sortedVendors.map(v => ({
            label: v.label.split(' ')[0], // Show first name only to save space
            value: `${v.value.toLocaleString()} Bs`
        }));
    } else {
        this.stats[2].items = [
            { label: 'N/A', value: '0 Bs' }
        ];
    }

    // Card 4: Antigüedad (Nuevos vs Antiguos)
    const nuevosCount = this.filteredMembers.filter(m => (m['Antigüedad'] || '').toLowerCase().includes('nuevo')).length;
    const antiguosCount = this.filteredMembers.filter(m => (m['Antigüedad'] || '').toLowerCase().includes('antiguo')).length;

    this.stats[3].title = 'Antigüedad';
    this.stats[3].icon = 'clock'; // Or 'calendar'
    this.stats[3].color = 'primary';
    this.stats[3].items = [
        { label: 'Nuevos', value: nuevosCount.toLocaleString() },
        { label: 'Antiguos', value: antiguosCount.toLocaleString() }
    ];
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

      // Filter by Producto (Membresía)
      if (this.filterData.producto) {
        const productLower = (m.Producto || '').toLowerCase();
        
        if (this.filterData.producto === 'Combos') {
            if (!productLower.includes('combo')) match = false;
        } else if (this.filterData.producto === 'Abonos') {
            if (!productLower.includes('abono') || productLower.includes('combo')) match = false;
        } else if (this.filterData.producto === 'Sociedades') {
            if (productLower.includes('abono') || productLower.includes('combo')) match = false;
        }
      }

      // Filter by Date Range (Fecha de Alta)
      if (this.filterData.startDate) {
          const mDate = new Date(m['Fecha de Alta']);
          // Check for valid date
          if (!isNaN(mDate.getTime())) {
              const start = new Date(this.filterData.startDate);
              // Normalize times
              start.setHours(0,0,0,0);
              mDate.setHours(0,0,0,0);

              if (mDate < start) match = false;
          }
      }

      if (this.filterData.endDate) {
          const mDate = new Date(m['Fecha de Alta']);
          if (!isNaN(mDate.getTime())) {
              const end = new Date(this.filterData.endDate);
              end.setHours(23,59,59,999);
              
              // We need a fresh copy or reset mDate if reused from above block in a real iterator, 
              // but here mDate is fresh per 'if' block scope (const).
              mDate.setHours(0,0,0,0); 

              if (mDate > end) match = false;
          }
      }

      return match;
    });
    
    this.currentPage = 1; // Reset to first page
    this.calculateStats();
    this.updatePagination();

    // Show success message
    this.showFilterSuccess = true;
    setTimeout(() => {
        this.showFilterSuccess = false;
    }, 3000);
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
      soloConSaldo: false,
      producto: null,
      startDate: null,
      endDate: null
    };
    this.updateExecutiveList(); // Reset executive list based on default year
    this.updateCategoryList(); // Reset category list
    this.applyFilters();
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
