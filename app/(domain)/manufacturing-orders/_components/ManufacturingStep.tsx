"use client"

import { Badge } from "@/components/ui/badge"
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

import WorkCenterCombobox from "@/my-components/domains/WorkCenterCombobox"
import {
    Clock
} from "lucide-react"
import { useEffect, useState } from 'react'
import { getRoutingSteps, RoutingStepResponse } from "../_services/manufacturingOrderService"

export interface ExtendedRoutingStep extends RoutingStepResponse {
    workCenterId?: string | number;
}

interface ManufacturingStepProps {
    steps: ExtendedRoutingStep[];
    onStepsChange: (steps: ExtendedRoutingStep[]) => void;
    mode?: 'create' | 'detail';
}

export default function ManufacturingStep({ steps, onStepsChange, mode = 'create' }: ManufacturingStepProps) {
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const handleStartOrder = () => {
        setIsStarted(true);
    };

    const handleFinishOrder = () => {
        setIsFinished(true);
        setIsStarted(false);
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
            {mode === 'detail' && (
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
                            <TableHead className="font-semibold">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {steps.map((item, index) => (
                            <TableRow key={item.routingStepId} className="hover:bg-muted/50 transition-colors">
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.operationName}</TableCell>
                                <TableCell>
                                    <WorkCenterCombobox
                                        value={item.workCenterId}
                                        onChange={(val) => handleWorkCenterChange(item.routingStepId, val)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {formatDuration(item.operationTime)}
                                </TableCell>
                                {mode === 'detail' && <TableCell >
                                    <span>
                                        {formatDuration(0)}
                                    </span>
                                </TableCell>}
                                <TableCell>
                                    <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">Chờ bắt đầu</Badge>
                                </TableCell>
                            </TableRow>
                        ))}

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
