import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Product {
  id?: number;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
}

export interface SaleRecord {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  saleDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8082/api/products';
  
  // Reactive product state
  private readonly productsSignal = signal<Product[]>([]);
  public readonly products = this.productsSignal.asReadonly();

  constructor(private http: HttpClient) {}

  // Fetch all products and update the signal
  loadAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(productsList => this.productsSignal.set(productsList))
    );
  }

  // Get product by id
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Add a new product
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(newProduct => {
        this.productsSignal.update(current => [...current, newProduct]);
      })
    );
  }

  // Update product
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap(updatedProduct => {
        this.productsSignal.update(current => 
          current.map(p => p.id === id ? updatedProduct : p)
        );
      })
    );
  }

  // Delete product
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.productsSignal.update(current => current.filter(p => p.id !== id));
      })
    );
  }

  // Sell product
  sellProduct(id: number, quantity: number): Observable<Product> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.post<Product>(`${this.apiUrl}/sell/${id}`, {}, { params }).pipe(
      tap(updatedProduct => {
        this.productsSignal.update(current => 
          current.map(p => p.id === id ? updatedProduct : p)
        );
      })
    );
  }

  // Get sales records history
  getSalesRecords(): Observable<SaleRecord[]> {
    return this.http.get<SaleRecord[]>(`${this.apiUrl}/sales-records`);
  }
}
