"use client"

import React, { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Plus,
    Trash2,
    Save,
    X,
    Play,
    CheckSquare,
    Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox"

interface Activity {
    id: string
    name: string
    area: string
    estimatedTime: number // hours
    actualTime: number // hours
    status: 'pending' | 'in_progress' | 'completed'
}

const AREA_LIST: ComboboxItem[] = [
    { id: "Kho Nguyên Liệu", value: "Kho Nguyên Liệu" },
    { id: "Xưởng Cắt", value: "Xưởng Cắt" },
    { id: "Chuyền May 1", value: "Chuyền May 1" },
    { id: "Chuyền May 2", value: "Chuyền May 2" },
    { id: "Tổ Là/Ủi", value: "Tổ Là/Ủi" },
    { id: "Khu vực QA/QC", value: "Khu vực QA/QC" },
    { id: "Tổ Đóng Gói", value: "Tổ Đóng Gói" },
    { id: "Kho Thành Phẩm", value: "Kho Thành Phẩm" },
]

function DurationPicker({ value, onChange, disabled }: { value: number, onChange: (val: number) => void, disabled?: boolean }) {
    // Calculate initial H, M, S from decimal hours
    const h = Math.floor(value)
    const m = Math.floor((value - h) * 60)
    const s = Math.round(((value - h) * 60 - m) * 60)

    const [hours, setHours] = useState(h)
    const [minutes, setMinutes] = useState(m)
    const [seconds, setSeconds] = useState(s)

    // Sync inputs when value prop changes externally (e.g. reset)
    useEffect(() => {
        const h = Math.floor(value)
        const m = Math.floor((value - h) * 60)
        const s = Math.round(((value - h) * 60 - m) * 60)
        setHours(h)
        setMinutes(m)
        setSeconds(s)
    }, [value])

    const updateTime = (newH: number, newM: number, newS: number) => {
        setHours(newH)
        setMinutes(newM)
        setSeconds(newS)
        onChange(newH + newM / 60 + newS / 3600)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9 px-3 border-slate-200"
                    disabled={disabled}
                >
                    <Clock className="mr-2 h-4 w-4 opacity-50" />
                    <span>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="center">
                <div className="flex gap-2 items-end">
                    <div className="grid gap-1 font-medium text-xs text-center">
                        <Label>Giờ</Label>
                        <Input
                            type="number"
                            min={0}
                            value={hours}
                            onChange={e => updateTime(Math.max(0, parseInt(e.target.value) || 0), minutes, seconds)}
                            className="w-16 h-8 text-center"
                        />
                    </div>
                    <span className="mb-2 font-bold text-slate-400">:</span>
                    <div className="grid gap-1 font-medium text-xs text-center">
                        <Label>Phút</Label>
                        <Input
                            type="number"
                            min={0}
                            max={59}
                            value={minutes}
                            onChange={e => updateTime(hours, Math.max(0, Math.min(59, parseInt(e.target.value) || 0)), seconds)}
                            className="w-16 h-8 text-center"
                        />
                    </div>
                    <span className="mb-2 font-bold text-slate-400">:</span>
                    <div className="grid gap-1 font-medium text-xs text-center">
                        <Label>Giây</Label>
                        <Input
                            type="number"
                            min={0}
                            max={59}
                            value={seconds}
                            onChange={e => updateTime(hours, minutes, Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                            className="w-16 h-8 text-center"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default function ManufacturingStep() {
    // Initial sample data
    const [activities, setActivities] = useState<Activity[]>([
        { id: '1', name: 'Cắt vải', area: 'Xưởng Cắt', estimatedTime: 4, actualTime: 4.5, status: 'completed' },
        { id: '2', name: 'May ráp', area: 'Chuyền May 1', estimatedTime: 12, actualTime: 0, status: 'in_progress' },
        { id: '3', name: 'Kiểm hàng', area: 'Khu vực QA/QC', estimatedTime: 2, actualTime: 0, status: 'pending' },
    ])

    const [newActivity, setNewActivity] = useState<Partial<Activity> | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setActivities(prev => prev.map(a => {
                if (a.status === 'in_progress') {
                    // Add 1 second (1/3600 hour)
                    return { ...a, actualTime: a.actualTime + (1 / 3600) }
                }
                return a
            }))
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const handleAddRow = () => {
        setNewActivity({
            name: '',
            area: '',
            estimatedTime: 0,
            actualTime: 0,
            status: 'pending'
        })
    }

    const handleSaveNew = () => {
        if (newActivity && newActivity.name && newActivity.area) {
            setActivities([
                ...activities,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    name: newActivity.name,
                    area: newActivity.area,
                    estimatedTime: Number(newActivity.estimatedTime) || 0,
                    actualTime: Number(newActivity.actualTime) || 0,
                    status: 'pending'
                } as Activity
            ])
            setNewActivity(null)
        }
    }

    const handleCancelNew = () => {
        setNewActivity(null)
    }

    const handleDelete = (id: string) => {
        setActivities(activities.filter(a => a.id !== id))
    }

    const handleStatusChange = (id: string, currentStatus: Activity['status']) => {
        setActivities(activities.map(a => {
            if (a.id === id) {
                if (currentStatus === 'pending') return { ...a, status: 'in_progress' }
                if (currentStatus === 'in_progress') return { ...a, status: 'completed' }
            }
            return a
        }))
    }

    const formatDuration = (hours: number) => {
        const h = Math.floor(hours)
        const m = Math.floor((hours - h) * 60)
        const s = Math.round(((hours - h) * 60 - m) * 60)
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

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
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-slate-800">Hoạt động sản xuất</CardTitle>
                {!newActivity && (
                    <Button
                        onClick={handleAddRow}
                        size="sm"
                        className="bg-[#7c6ee6] hover:bg-[#6c5dd3] text-white shadow-sm gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm hoạt động
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-[30%] text-xs font-semibold uppercase text-slate-500 tracking-wider">Tên công đoạn</TableHead>
                            <TableHead className="w-[20%] text-xs font-semibold uppercase text-slate-500 tracking-wider">Khu vực</TableHead>
                            <TableHead className="w-[15%] text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">DK (hh:mm:ss)</TableHead>
                            <TableHead className="w-[15%] text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">TT (hh:mm:ss)</TableHead>
                            <TableHead className="w-[10%] text-xs font-semibold uppercase text-slate-500 tracking-wider text-center">Trạng thái</TableHead>
                            <TableHead className="w-[10%] text-right text-xs font-semibold uppercase text-slate-500 tracking-wider">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => (
                            <TableRow key={activity.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-medium text-slate-700 py-3">{activity.name}</TableCell>
                                <TableCell className="text-slate-600 py-3">{activity.area}</TableCell>
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
                                <TableCell className="text-right py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        {activity.status === 'pending' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusChange(activity.id, 'pending')}
                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                title="Bắt đầu"
                                            >
                                                <Play className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {activity.status === 'in_progress' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusChange(activity.id, 'in_progress')}
                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                title="Hoàn thành"
                                            >
                                                <CheckSquare className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {activity.status === 'completed' && (
                                            <div className="w-8 h-8"></div> // Spacer
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(activity.id)}
                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {newActivity && (
                            <TableRow className="bg-slate-50/30">
                                <TableCell className="py-2">
                                    <Input
                                        value={newActivity.name}
                                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                        placeholder="Nhập tên..."
                                        className="h-9 border-slate-200 focus-visible:ring-[#7c6ee6]"
                                        autoFocus
                                    />
                                </TableCell>
                                <TableCell className="py-2">
                                    <MyCombobox
                                        items={AREA_LIST}
                                        value={newActivity.area}
                                        onChange={(val) => setNewActivity({ ...newActivity, area: String(val) })}
                                        placeholder="Chọn khu vực..."
                                        searchPlaceholder="Tìm khu vực..."
                                        width="w-[180px]"
                                    />
                                </TableCell>
                                <TableCell className="py-2">
                                    <DurationPicker
                                        value={newActivity.estimatedTime || 0}
                                        onChange={(val) => setNewActivity({ ...newActivity, estimatedTime: val })}
                                    />
                                </TableCell>
                                <TableCell className="py-2">
                                    {/* Actual time usually starts at 0 */}
                                    <div className="text-right px-3 text-sm text-slate-400">00:00:00</div>
                                </TableCell>
                                <TableCell className="py-2 text-center">
                                    <Badge variant="outline" className="text-slate-400 border-dashed">Mới</Badge>
                                </TableCell>
                                <TableCell className="text-right py-2">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            size="icon"
                                            onClick={handleSaveNew}
                                            className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Save className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleCancelNew}
                                            className="h-8 w-8 text-slate-500 hover:text-slate-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {activities.length === 0 && !newActivity && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                    Chưa có hoạt động nào. Nhấn "Thêm hoạt động" để bắt đầu.
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
