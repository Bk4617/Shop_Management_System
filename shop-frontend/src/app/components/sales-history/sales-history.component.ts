import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product, SaleRecord } from '../../services/product.service';

export interface DisplaySaleRecord {
  id?: number;
  productId: number;
  productName: string;
  description: string;
  category: string;
  unitPrice: number;
  quantity: number; // Stock Sold
  totalPrice: number;
  saleDate: string;
}

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.css'
})
export class SalesHistoryComponent implements OnInit {
  private readonly productService = inject(ProductService);

  // Raw states
  protected readonly products = this.productService.products;
  protected readonly salesRecords = signal<SaleRecord[]>([]);

  // Display-mapped sales records
  protected readonly displayRecords = computed<DisplaySaleRecord[]>(() => {
    const productsList = this.products();
    return this.salesRecords().map(record => {
      const product = productsList.find(p => p.id === record.productId);
      return {
        id: record.id,
        productId: record.productId,
        productName: record.productName,
        description: product ? product.description : 'Product information unavailable',
        category: product ? product.category : 'N/A',
        unitPrice: product ? product.price : (record.quantity > 0 ? (record.totalPrice / record.quantity) : 0),
        quantity: record.quantity,
        totalPrice: record.totalPrice,
        saleDate: record.saleDate
      };
    });
  });

  // Grand Total Revenue
  protected readonly totalRevenue = computed(() => {
    return this.salesRecords().reduce((sum, record) => sum + record.totalPrice, 0);
  });

  ngOnInit(): void {
    // Load products and sales records
    this.productService.loadAllProducts().subscribe();
    this.productService.getSalesRecords().subscribe({
      next: (records) => this.salesRecords.set(records),
      error: (err) => console.error('Failed to load sales history', err)
    });
  }
}
