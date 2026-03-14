"use client";

import { createContext, PropsWithChildren, useMemo, useReducer } from "react";

// =================================================================================
type InitialState = { cart: CartItem[]; couponCode: string; selectedAddressId: string };

export interface CartItem {
  id: string;
  qty: number;
  title: string;
  slug: string;
  price: number;
  thumbnail: string;
  size?: string;
  color?: string;
}

interface CartActionType {
  payload?: CartItem;
  couponCode?: string;
  addressId?: string;
  type: "CHANGE_CART_AMOUNT" | "CLEAR_CART" | "SET_COUPON_CODE" | "SET_CHECKOUT_ADDRESS";
}

// =================================================================================
const INITIAL_STATE = { cart: [] as CartItem[], couponCode: "", selectedAddressId: "" };

// ==============================================================
interface ContextProps {
  state: InitialState;
  dispatch: (args: CartActionType) => void;
}
// ==============================================================

export const CartContext = createContext<ContextProps>({} as ContextProps);

export const getCartItemKey = (item: Pick<CartItem, "id" | "size" | "color">) =>
  `${item.id}__${item.size ?? ""}__${item.color ?? ""}`;

export const getCartSubtotal = (cart: CartItem[]) =>
  cart.reduce((acc, item) => acc + item.price * item.qty, 0);

export const getCartQuantity = (cart: CartItem[]) =>
  cart.reduce((acc, item) => acc + item.qty, 0);

const reducer = (state: InitialState, action: CartActionType) => {
  switch (action.type) {
    case "CHANGE_CART_AMOUNT":
      const cartList = state.cart;
      const cartItem = action.payload;

      if (cartItem === undefined) return state;

      const existIndex = cartList.findIndex(
        (item) =>
          item.id === cartItem!.id &&
          (item.size ?? "") === (cartItem.size ?? "") &&
          (item.color ?? "") === (cartItem.color ?? "")
      );

      // REMOVE ITEM IF QUANTITY IS LESS THAN 1
      if (cartItem.qty < 1) {
        const updatedCart = cartList.filter(
          (item) =>
            !(
              item.id === cartItem!.id &&
              (item.size ?? "") === (cartItem.size ?? "") &&
              (item.color ?? "") === (cartItem.color ?? "")
            )
        );
        return { ...state, cart: updatedCart };
      }

      // IF PRODUCT ALREADY EXITS IN CART
      if (existIndex > -1) {
        const updatedCart = [...cartList];
        updatedCart[existIndex].qty = cartItem.qty;
        return { ...state, cart: updatedCart };
      }

      return { ...state, cart: [...cartList, cartItem] };

    case "CLEAR_CART":
      return { ...state, cart: [], couponCode: "", selectedAddressId: "" };

    case "SET_COUPON_CODE":
      return { ...state, couponCode: action.couponCode?.trim().toUpperCase() ?? "" };

    case "SET_CHECKOUT_ADDRESS":
      return { ...state, selectedAddressId: action.addressId ?? "" };

    default: {
      return state;
    }
  }
};

export default function CartProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <CartContext value={contextValue}>{children}</CartContext>;
}
