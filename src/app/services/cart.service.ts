import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {}

  addToCart(theCartItem: CartItem) {
    // check if already have the item in cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined!;

    if (this.cartItems.length > 0) {
      // find the item in the cart based in item id
      existingCartItem = this.cartItems.find(
        (tempCartItem) => tempCartItem.id === theCartItem.id
      )!;

      // check if found it
      alreadyExistsInCart = existingCartItem != undefined;
    }

    if (alreadyExistsInCart) {
      existingCartItem.quantity++;
    } else {
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // get index of item
    const itemIndex = this.cartItems.findIndex(
      (tempCartItem) => tempCartItem.id == theCartItem.id
    );

    // if found, remove the item
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.unitPrice * currentCartItem.quantity;
      totalQuantityValue += currentCartItem.quantity;
    }

    // public the new values
    // all subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('cart');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.unitPrice * tempCartItem.quantity;
      console.log(
        `name: ${tempCartItem.name}, unitPrice: ${tempCartItem.unitPrice}, quantity: ${tempCartItem.quantity}, subTotal: ${subTotalPrice}`
      );
    }

    console.log(
      `Total: ${totalPriceValue.toFixed(2)}, Quantity: ${totalQuantityValue}`
    );
    console.log('----');
  }
}
