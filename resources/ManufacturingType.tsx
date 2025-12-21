export const enum ManufacturingType {
    Draft = 1,
    Confirmed = 2,
    InProgress = 3,
    Paused = 4,
    Done = 5,
    Cancelled = 6,
}

export const MANUFACTURING_TYPE_LABELS: Record<ManufacturingType, string> = {
    [ManufacturingType.Draft]: "Bản nháp",
    [ManufacturingType.Confirmed]: "Đã xác nhận",
    [ManufacturingType.InProgress]: "Đang sản xuất",
    [ManufacturingType.Paused]: "Tạm dừng",
    [ManufacturingType.Done]: "Hoàn thành",
    [ManufacturingType.Cancelled]: "Hủy bỏ",
};

export const MANUFACTURING_TYPE_COLORS: Record<ManufacturingType, string> = {
    [ManufacturingType.Draft]: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
    [ManufacturingType.Confirmed]: "bg-amber-100 text-amber-700 hover:bg-amber-100/80",
    [ManufacturingType.InProgress]: "bg-slate-100 text-slate-700 hover:bg-slate-100/80",
    [ManufacturingType.Paused]: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
    [ManufacturingType.Done]: "bg-green-100 text-green-700 hover:bg-green-100/80",
    [ManufacturingType.Cancelled]: "bg-red-100 text-red-700 hover:bg-red-100/80",
};
