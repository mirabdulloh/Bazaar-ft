"use client";

import { createContext, PropsWithChildren, use, useState } from "react";
import Product from "models/Product.model";

// =================================================================================
interface PickerState {
  open: boolean;
  product: Product | null;
}

interface ContextProps {
  state: PickerState;
  openPicker: (product: Product) => void;
  closePicker: () => void;
}
// =================================================================================

export const VariantPickerContext = createContext<ContextProps>({} as ContextProps);

export default function VariantPickerProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PickerState>({ open: false, product: null });

  const openPicker  = (product: Product) => setState({ open: true, product });
  const closePicker = ()                  => setState({ open: false, product: null });

  return (
    <VariantPickerContext value={{ state, openPicker, closePicker }}>
      {children}
    </VariantPickerContext>
  );
}

export function useVariantPicker() {
  return use(VariantPickerContext);
}
