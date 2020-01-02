import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorage } from '../../../auth/token.storage';


@Injectable()

export class ProductsService {
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'token': this.tokenService.getToken()
  });
  headersFormData = new HttpHeaders({
    'token': this.tokenService.getToken()
  });
  url = '/api/product/products';
  url2 = '/api/product/pcategory';
  url3 = '/api/product/brand';
  url4 = '/api/product/user/hub';
  url5 = 'api/product/upload/brand';
  url6 = 'api/product/upload/category';
  url7 = 'api/product/upload/product';
  url8 = 'api/product/pcattribute';
  productVarientURL = 'api/product/pvarients';
  subCategoryURL = 'api/product/pcategory';
  constructor(private http: HttpClient, private tokenService: TokenStorage) { }

  getAllProduct() {
    return this.http.get(this.url + '/all', { headers: this.headers });
  }

  addProduct(product) {
    return this.http.post(this.url + '/', product, { headers: this.headersFormData });
  }

  deleteProduct(id) {
    return this.http.delete(this.url + '/' + id, { headers: this.headers });
  }

  updateProduct(product, id) {
    return this.http.put(this.url + '/id/' + id, product, { headers: this.headersFormData });
  }

  importCustomer(csv) {
    return this.http.post(this.url + '/import', csv);
  }

  getAllCategory() {
    return this.http.get(this.url2 + '/all', { headers: this.headers });
  }

  addCategory(category) {
    return this.http.post(this.url2 + '/', category, { headers: this.headersFormData });
  }

  deleteCategory(id) {
    return this.http.delete(this.url2 + '/' + id, { headers: this.headers });
  }

  updateCategory(category, id) {
    return this.http.put(this.url2 + '/' + id, category, { headers: this.headersFormData });
  }
  // Brand API
  getAllBrand() {
    return this.http.get(this.url3 + '/', { headers: this.headers });
  }

  addBrand(brand) {
    return this.http.post(this.url3 + '/', brand, { headers: this.headersFormData });
  }

  deleteBrand(id) {
    return this.http.delete(this.url3 + '/' + id, { headers: this.headers });
  }

  updateBrand(brand, id) {
    return this.http.put(this.url3 + '/' + id, brand, { headers: this.headersFormData });
  }

  // Hub User

  getAllHub() {
    return this.http.get(this.url4 + '/', { headers: this.headers });
  }

  // Brand Image

  getUrl() {
    return this.http.get(this.url5 + '/', { headers: this.headers });
  }

  sendUrl(url, file) {
    return fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'jpeg,png'
      }
    });
  }

  // Category Image Uplaod
  getUrlCategory() {
    return this.http.get(this.url6 + '/', { headers: this.headers });
  }

  sendUrlCategory(url, file) {
    return fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'jpeg,png'
      }
    });
  }

  // UPLOAD VAIRNET IMAGES
  uploadProductImages(productId, images) {
    return this.http.put(this.productVarientURL + '/images/' + productId, images, {
      headers: new HttpHeaders({
        'token': this.tokenService.getToken()
      })
    });
  }

  // Product Image Upload
  getUrlProduct() {
    return this.http.get(this.url7 + '/', { headers: this.headers });
  }

  sendUrlProduct(url, file) {
    return fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'jpeg,png'
      }
    });
  }

  // Attribute Api
  getAllAttributeSpecificCategory(id) {
    return this.http.get(this.url8 + '/category/' + id, { headers: this.headers });
  }

  addAttribute(attribute) {
    return this.http.post(this.url8 + '/', attribute, { headers: this.headers });
  }

  getAllAttributes() {
    return this.http.get(this.url8 + '/all', { headers: this.headers });
  }

  updateAttribute(attribute, id) {
    return this.http.put(this.url8 + '/' + id, attribute, { headers: this.headers });
  }

  // UPDATE STOCK
  updateProductStock(data) {
    return this.http.put(this.url + '/stock', data, { headers: this.headers });
  }

  getAllCategorysub(id) {
    return this.http.get(this.subCategoryURL + '/id/' + id, { headers: this.headers });
  }

    // UPLOAD VARIENT IMAGES
    uploadVarientImages(productId, images) {
      return this.http.put(this.productVarientURL + '/images/' + productId, images, {
        headers: new HttpHeaders({
          'token': this.tokenService.getToken()
        })
      });
    }

}
