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

interface Activity {
    id: string
    name: string
    estimatedTime: number // hours
    actualTime: number // hours
    status: 'pending' | 'in_progress' | 'completed'
    workCenterId?: string | number
}




export default function ManufacturingStep() {
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([
        { id: '1', name: 'Cắt vải', estimatedTime: 4, actualTime: 0, status: 'pending' },
        { id: '2', name: 'May ráp', estimatedTime: 12, actualTime: 0, status: 'pending' },
        { id: '3', name: 'Kiểm hàng', estimatedTime: 2, actualTime: 0, status: 'pending' },
    ])

    useEffect(() => {
        const interval = setInterval(() => {
            setActivities(prev => prev.map(a => {
                if (a.status === 'in_progress') {
                    return { ...a, actualTime: a.actualTime + (1 / 3600) }
                }
                return a
            }))
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const handleStartOrder = () => {
        setIsStarted(true);
        setActivities(activities.map(a => ({ ...a, status: 'in_progress' })));
    };

    const handleFinishOrder = () => {
        setIsFinished(true);
        setIsStarted(false);
        setActivities(activities.map(a => ({ ...a, status: 'completed' })));
    };

    const handleWorkCenterChange = (activityId: string, workCenterId: string | number) => {
        setActivities(prev => prev.map(a =>
            a.id === activityId ? { ...a, workCenterId: workCenterId } : a
        ));
    };

    const totalEstimated = activities.reduce((acc, curr) => acc + curr.estimatedTime, 0)
    const totalActual = activities.reduce((acc, curr) => acc + curr.actualTime, 0)
    const getStatusBadge = (status: Activity['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">Chờ bắt đầu</Badge>
            case 'in_progress':
                return <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 animate-pulse">Đang thực hiện</Badge>
            case 'completed':
                return <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100 hover:bg-green-100">Hoàn thành</Badge>
        }
    }

    return (
        <Card className="w-full border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex justify-end items-center">
                {!isStarted && !isFinished && (
                    <ActionButton action="start" onClick={handleStartOrder} />
                )}
                {isStarted && !isFinished && (
                    <ActionButton action="finish" onClick={handleFinishOrder} />
                )}
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-semibold">STT</TableHead>
                            <TableHead className="font-semibold">Tên công đoạn</TableHead>
                            <TableHead className="font-semibold">Khu vực</TableHead>
                            <TableHead className="font-semibold text-right">Thời gian dự kiến</TableHead>
                            <TableHead className="font-semibold text-right">Thời gian thực hiện</TableHead>
                            <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity, index) => (
                            <TableRow key={activity.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-medium text-slate-700 py-3">{index + 1}</TableCell>
                                <TableCell className="font-medium text-slate-700 py-3">{activity.name}</TableCell>
                                <TableCell className="font-medium text-slate-700 py-3">
                                    <WorkCenterCombobox
                                        className="w-full mt-2"
                                        value={activity.workCenterId}
                                        onChange={(val) => handleWorkCenterChange(activity.id, val)}
                                    />
                                </TableCell>
                                <TableCell className="text-slate-600 py-3 text-right font-variant-numeric tabular-nums">
                                    {formatDuration(activity.estimatedTime)}
                                </TableCell>
                                <TableCell className="text-right py-3 font-variant-numeric tabular-nums">
                                    <span className={`${activity.actualTime > activity.estimatedTime ? 'text-red-500 font-medium' : 'text-slate-600'}`}>
                                        {formatDuration(activity.actualTime)}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                    {getStatusBadge(activity.status)}
                                </TableCell>
                            </TableRow>
                        ))}

                        {activities.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                    Chưa có công đoạn nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-4 px-6 flex justify-end">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-600">Tổng thời gian dự kiến:</span>
                        <span className="text-lg font-bold text-slate-900 font-variant-numeric tabular-nums">{formatDuration(totalEstimated)}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-600">Tổng thời gian thực tế:</span>
                        <span className={`text-lg font-bold font-variant-numeric tabular-nums ${totalActual > totalEstimated ? 'text-red-600' : 'text-slate-900'}`}>
                            {formatDuration(totalActual)}
                        </span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
