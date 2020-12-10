import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Person, Product } from '../model';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  customerList:Person[] = [];
  employeeList:Person[] = [];
  shipperList:Person[] = [];
  productList:Product[] = [];
  form:FormGroup;
  productArray:FormArray;

  constructor(private fb: FormBuilder, private apiSvc: ApiService) { }

  ngOnInit(): void {
    this.initData()
    this.form = this.createForm()
    this.productArray = this.form.get('products') as FormArray
  }

  private async initData () {
    this.customerList = await this.apiSvc.getData('customers');
    this.employeeList = await this.apiSvc.getData('employees');
    this.shipperList = await this.apiSvc.getData('shippers');
    this.productList = await this.apiSvc.getData('products');
    console.info(this.productList)
  }

  addProduct() {
    const p = this.createProduct()
    this.productArray.push(p)
  }

  removeProduct(i:number) {
    this.productArray.removeAt(i)
  }

  private createForm () {
    return this.form = this.fb.group({
      customer_id: this.fb.control('',[Validators.required]),
      employee_id: this.fb.control('',[Validators.required]),
      shipper_id: this.fb.control('',[Validators.required]),
      products: this.fb.array([])
    })
  }

  private createProduct():FormGroup {
    return this.fb.group({
      name: this.fb.control('', [Validators.required]),
      qty: this.fb.control('', [Validators.required])
    })
  }
}
