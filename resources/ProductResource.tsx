export const enum ProductType {
  FinishedProduct = 1,
  SemiFinished = 2,
  RawMaterial = 3,
  Consumable = 4,
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.FinishedProduct]: "Thành phẩm",
  [ProductType.SemiFinished]: "Bán thành phẩm",
  [ProductType.RawMaterial]: "Nguyên vật liệu",
  [ProductType.Consumable]: "Vật tư tiêu hao",
};

export const PRODUCT_TYPE_COLORS: Record<ProductType, string> = {
  [ProductType.FinishedProduct]: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
  [ProductType.SemiFinished]: "bg-amber-100 text-amber-700 hover:bg-amber-100/80",
  [ProductType.RawMaterial]: "bg-slate-100 text-slate-700 hover:bg-slate-100/80",
  [ProductType.Consumable]: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
};
