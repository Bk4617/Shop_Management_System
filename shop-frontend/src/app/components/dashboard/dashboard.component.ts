import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly productService = inject(ProductService);

  // Expose product state from service
  protected readonly products = this.productService.products;

  // Computed metrics using Signals
  protected readonly totalProductsCount = computed(() => this.products().length);

  protected readonly lowStockCount = computed(() => 
    this.products().filter(p => p.quantity > 0 && p.quantity <= 5).length
  );

  protected readonly outOfStockCount = computed(() => 
    this.products().filter(p => p.quantity === 0).length
  );

  protected readonly totalInventoryValue = computed(() => 
    this.products().reduce((sum, p) => sum + (p.price * p.quantity), 0)
  );

  protected readonly lowStockProducts = computed(() => 
    this.products().filter(p => p.quantity <= 5)
  );

  ngOnInit(): void {
    // Load products
    this.productService.loadAllProducts().subscribe();
  }
}
