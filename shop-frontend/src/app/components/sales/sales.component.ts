import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {
  private readonly productService = inject(ProductService);

  // State from service
  protected readonly products = this.productService.products;

  // POS State
  protected readonly searchTerm = signal('');
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly sellQuantity = signal<number>(1);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  // Computed: Products matching search term
  protected readonly filteredProducts = computed(() => {
    return this.products().filter(p => 
      p.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
      p.category.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  });

  // Computed: Total price for current checkout selection
  protected readonly totalCheckoutPrice = computed(() => {
    const prod = this.selectedProduct();
    if (!prod) return 0;
    return prod.price * this.sellQuantity();
  });

  ngOnInit(): void {
    this.productService.loadAllProducts().subscribe();
  }

  // Select Product to Sell
  selectProduct(product: Product): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    if (product.quantity <= 0) {
      this.errorMessage.set(`"${product.name}" is out of stock!`);
      return;
    }
    
    this.selectedProduct.set(product);
    this.sellQuantity.set(1);
  }

  // Adjust sale quantity
  adjustQuantity(amount: number): void {
    const prod = this.selectedProduct();
    if (!prod) return;

    const newQty = this.sellQuantity() + amount;
    if (newQty < 1) return;
    
    if (newQty > prod.quantity) {
      this.errorMessage.set(`Only ${prod.quantity} units available in inventory`);
      return;
    }

    this.errorMessage.set(null);
    this.sellQuantity.set(newQty);
  }

  // Handle manual/bulk quantity change
  onQuantityChange(value: number | null): void {
    const prod = this.selectedProduct();
    if (!prod) return;

    this.errorMessage.set(null);

    // Parse value as integer or handle empty/null
    const parsed = value ? Math.floor(value) : 1;

    if (parsed < 1) {
      this.sellQuantity.set(1);
      return;
    }

    if (parsed > prod.quantity) {
      this.errorMessage.set(`Only ${prod.quantity} units available in inventory`);
      this.sellQuantity.set(prod.quantity);
      return;
    }

    this.sellQuantity.set(parsed);
  }

  // Process checkout
  checkout(): void {
    const prod = this.selectedProduct();
    if (!prod) return;

    const qty = this.sellQuantity();
    if (qty <= 0) {
      this.errorMessage.set('Quantity must be greater than 0');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.productService.sellProduct(prod.id!, qty).subscribe({
      next: (updatedProd) => {
        this.isLoading.set(false);
        this.successMessage.set(`Successfully sold ${qty} unit(s) of "${prod.name}"!`);
        this.selectedProduct.set(null);
        this.sellQuantity.set(1);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Transaction failed. Check stock levels.');
        this.errorMessage.set(msg);
      }
    });
  }
}
