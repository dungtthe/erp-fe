import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { formatDuration } from "@/helpers/format"
import ActionButton from "@/my-components/btn/ActionButton"

import { api } from "@/lib/api"
import WorkCenterCombobox from "@/my-components/domains/WorkCenterCombobox"
import {
    Clock
} from "lucide-react"
import { useEffect, useState } from 'react'
import { RoutingStepResponse, doneManufacturingOrder } from "../_services/manufacturingOrderService"
import { ManufacturingType } from "@/resources/ManufacturingType"
import ToastManager from "@/helpers/ToastManager"

export interface ExtendedRoutingStep extends RoutingStepResponse {
    workCenterId?: string | number;
}

interface ManufacturingStepProps {
    steps: ExtendedRoutingStep[];
    onStepsChange: (steps: ExtendedRoutingStep[]) => void;
    mode?: 'create' | 'detail';
    manufacturingOrderId?: string;
    status?: number;
}

interface WorkCenter {
    id: string;
    name: string;
    description: string;
}

export default function ManufacturingStep({ steps, onStepsChange, mode = 'create', manufacturingOrderId, status }: ManufacturingStepProps) {
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);


    useEffect(() => {
        const fetchWorkCenters = async () => {
            if (mode === 'detail' && manufacturingOrderId) {
                try {
                    const response = await api.get<WorkCenter[]>(`/manufacturing-orders/get-work-centers/${manufacturingOrderId}`);
                    if (response.success && response.data) {
                        const map: WorkCenter[] = [];
                        response.data.forEach(wc => {
                            map.push({ id: wc.id, name: wc.name, description: wc.description });
                        });
                        setWorkCenters(map);
                        console.log(map);
                    }
                } catch (error) {
                    console.error("Failed to fetch work centers", error);
                }
            }
        };
        fetchWorkCenters();
    }, [mode, manufacturingOrderId]);

    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isStarted && !isFinished) {
            interval = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isStarted, isFinished]);

    const handleStartOrder = () => {
        setIsStarted(true);
    };

    const handleFinishOrder = async () => {
        if (!manufacturingOrderId) return;
        try {
            const res = await doneManufacturingOrder(manufacturingOrderId);
            if (res.success) {
                setIsFinished(true);
                setIsStarted(false);
                ToastManager.success("Đã hoàn thành lệnh sản xuất!");
                window.location.reload();
            } else {
                ToastManager.error("Lỗi: " + (res.error?.message || "Không xác định"));
            }
        } catch (error) {
            console.error(error);
            ToastManager.error("Lỗi hệ thống");
        }
    };

    const handleWorkCenterChange = (routingStepId: string, value: string | number) => {
        const newSteps = steps.map(step =>
            step.routingStepId === routingStepId ? { ...step, workCenterId: value } : step
        );
        onStepsChange(newSteps);
    };

    const totalEstimated = steps.reduce((acc, curr) => acc + curr.operationTime, 0)
    return (
        <Card className="w-full border-border shadow-sm bg-card">
            {mode === 'detail' && status === ManufacturingType.Confirmed && (
                <CardHeader className="flex justify-end items-center">
                    <div className="flex gap-2">
                        {!isStarted && !isFinished && (
                            <ActionButton action="start" onClick={handleStartOrder} />
                        )}
                        {isStarted && !isFinished && (
                            <ActionButton action="finish" onClick={handleFinishOrder} />
                        )}
                    </div>
                </CardHeader>
            )}
            <CardContent className="p-2">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-semibold">STT</TableHead>
                            <TableHead className="font-semibold">Tên công đoạn</TableHead>
                            <TableHead className="font-semibold">Phân xưởng</TableHead>
                            <TableHead className="font-semibold">Thời gian dự kiến</TableHead>
                            {mode === 'detail' && <TableHead className="font-semibold">Thời gian thực hiện</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {steps.map((item, index) => {
                            const workCenter = workCenters.find((w) => String(w.id) === String(item.workCenterId));
                            const displayWorkCenter = workCenter ? `${workCenter.name}${workCenter.description ? " - " + workCenter.description : ""}` : item.workCenterId;

                            return (
                                <TableRow key={item.routingStepId} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.operationName}</TableCell>
                                    <TableCell>
                                        {mode === 'detail' ? (
                                            <span>{displayWorkCenter}</span>
                                        ) : (
                                            <WorkCenterCombobox
                                                value={item.workCenterId}
                                                onChange={(val) => handleWorkCenterChange(item.routingStepId, val)}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {formatDuration(item.operationTime)}
                                    </TableCell>
                                    {mode === 'detail' && <TableCell >
                                        <span>
                                            {formatDuration(elapsedSeconds / 3600)}
                                        </span>
                                    </TableCell>}
                                </TableRow>
                            )
                        })}

                        {steps.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={mode === 'detail' ? 6 : 5} className="h-32 text-center text-muted-foreground">
                                    Chưa có công đoạn nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <CardFooter className="bg-muted/20 border-t border-border py-4 px-6 flex justify-end">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Tổng thời gian dự kiến:</span>
                        <span className="text-lg font-bold text-foreground font-variant-numeric tabular-nums">{formatDuration(totalEstimated)}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
