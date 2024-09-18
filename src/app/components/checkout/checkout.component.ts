import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormService } from '../../services/form.service';
import { City } from '../../common/city';
import { District } from '../../common/district';
import { CustomValidators } from '../../validators/custom-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  cities: City[] = [];
  shippingAddressDistricts: District[] = [];
  billingAddressDistricts: District[] = [];

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private formService: FormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        address: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [Validators.required]),
        district: new FormControl('', [Validators.required]),
      }),
      billingAddress: this.formBuilder.group({
        address: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [Validators.required]),
        district: new FormControl('', [Validators.required]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.notOnlyWhitespace,
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{16}'),
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{3}'),
        ]),
        expMonth: [''],
        expYear: [''],
      }),
    });

    const startMonth: number = new Date().getMonth() + 1;
    this.formService.getCreditCardMonths(startMonth).subscribe((data) => {
      this.creditCardMonths = data;
    });

    this.formService
      .getCreditCardYears()
      .subscribe((data) => (this.creditCardYears = data));

    this.formService.getCities().subscribe((data) => (this.cities = data));
  }

  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      (totalQuantity) => (this.totalQuantity = totalQuantity)
    );
    this.cartService.totalPrice.subscribe(
      (totalPrice) => (this.totalPrice = totalPrice)
    );
  }

  getDistricts(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const cityId = formGroup?.value.city.id;

    this.formService.getDistricts(cityId).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressDistricts = data;
      } else {
        this.billingAddressDistricts = data;
      }

      // select the first item by default
      formGroup?.get('district')?.setValue(data[0]);
    });
  }

  // getter methods to access form controls
  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }
  get shippingAddressAdresss() {
    return this.checkoutFormGroup.get('shippingAddress.address');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressDistrict() {
    return this.checkoutFormGroup.get('shippingAddress.district');
  }
  get billingAddressAdresss() {
    return this.checkoutFormGroup.get('billingAddress.address');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressDistrict() {
    return this.checkoutFormGroup.get('billingAddress.district');
  }
  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }
  get creditCardName() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  onSubmit() {

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(
      (cartItem) => new OrderItem(cartItem)
    );

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingCity: City = JSON.parse(
      JSON.stringify(purchase.shippingAddress.city)
    );
    const shippingDistrict: District = JSON.parse(
      JSON.stringify(purchase.shippingAddress.district)
    );
    purchase.shippingAddress.city = shippingCity.name;
    purchase.shippingAddress.district = shippingDistrict.name;

    // populate purchase - billing address
    purchase.billingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;
    const billingCity: City = JSON.parse(
      JSON.stringify(purchase.shippingAddress.city)
    );
    const billingDistrict: District = JSON.parse(
      JSON.stringify(purchase.billingAddress.district)
    );
    purchase.billingAddress.city = billingCity.name;
    purchase.billingAddress.district = billingDistrict.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response) => {
        alert(
          `Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`
        );

        // reset cart
        this.resetCart()
      },
      error: (err) => {
        alert(`There was an error: ${err.message}`);
      },
    });
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );

      this.billingAddressDistricts = this.shippingAddressDistricts;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressDistricts = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expYear);

    // if the current year equals the selected year, start with current month

    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.formService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to products page
    this.router.navigateByUrl('/products');
  }
}
