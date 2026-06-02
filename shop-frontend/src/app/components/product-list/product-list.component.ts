import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);

  // Expose state from service
  protected readonly products = this.productService.products;

  // Search & Filter State
  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal('All');

  // Modal Dialog State
  protected readonly isModalOpen = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Form Model
  protected readonly formProduct = signal<Product>({
    name: '',
    description: '',
    category: '',
    price: 0,
    quantity: 0
  });

  // Computed: Unique categories list for filtering
  protected readonly categories = computed(() => {
    const list = this.products().map(p => p.category);
    return ['All', ...Array.from(new Set(list))];
  });

  // Computed: Filtered products based on search term and category selection
  protected readonly filteredProducts = computed(() => {
    return this.products().filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                            p.description.toLowerCase().includes(this.searchTerm().toLowerCase());
      
      const matchesCategory = this.selectedCategory() === 'All' || 
                              p.category.toLowerCase() === this.selectedCategory().toLowerCase();

      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit(): void {
    this.productService.loadAllProducts().subscribe();
  }

  // Open Modal to Add Product
  openAddModal(): void {
    this.isEditMode.set(false);
    this.errorMessage.set(null);
    this.formProduct.set({
      name: '',
      description: '',
      category: '',
      price: 0,
      quantity: 0
    });
    this.isModalOpen.set(true);
  }

  // Open Modal to Edit Product
  openEditModal(product: Product): void {
    this.isEditMode.set(true);
    this.errorMessage.set(null);
    // Clone product to avoid editing the table data directly in real-time
    this.formProduct.set({ ...product });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  // Save or Update Product
  saveProduct(): void {
    const product = this.formProduct();
    if (!product.name || !product.category || product.price === null || product.quantity === null) {
      this.errorMessage.set('All fields are required');
      return;
    }

    if (product.price < 0 || product.quantity < 0) {
      this.errorMessage.set('Price and Quantity must be positive values');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.isEditMode()) {
      // Update
      const id = product.id!;
      this.productService.updateProduct(id, product).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to update product');
          this.errorMessage.set(msg);
        }
      });
    } else {
      // Create
      this.productService.addProduct(product).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to add product');
          this.errorMessage.set(msg);
        }
      });
    }
  }

  // Delete Product
  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product from the inventory?')) {
      this.productService.deleteProduct(id).subscribe({
        error: (err) => {
          const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to delete product');
          alert(msg);
        }
      });
    }
  }
}
