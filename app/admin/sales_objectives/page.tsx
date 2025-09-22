"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createSalesObjective, getUsers } from "../../../lib/supabase/sales_objectives"
import { Target, User, Calendar, TrendingUp, DollarSign, Users, CheckCircle, AlertCircle, Sparkles, BarChart3 } from
"lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function SalesObjectiveForm() {
const [users, setUsers] = useState<{ id: string; name: string }[]>([])
    const [userId, setUserId] = useState("")
    const [month, setMonth] = useState<number | "">("")
        const [year, setYear] = useState<number | "">("")
            const [leadsTarget, setLeadsTarget] = useState<number | "">("")
                const [salesTarget, setSalesTarget] = useState<number | "">("")
                    const [salesTargetValue, setSalesTargetValue] = useState<number | "">("")
                        const [message, setMessage] = useState("")
                        const [isLoading, setIsLoading] = useState(false)

                        useEffect(() => {
                        async function loadUsers() {
                        try {
                        const data = await getUsers()
                        setUsers(data)
                        } catch (error) {
                        console.error(error)
                        }
                        }
                        loadUsers()
                        }, [])

                        const handleSubmit = async (e: React.FormEvent) => {
                        e.preventDefault()
                        setIsLoading(true)

                        if (!userId || month === "" || year === "" || leadsTarget === "" ||
                        salesTarget === "" || salesTargetValue === "") {
                        setMessage("Completa todos los campos")
                        setIsLoading(false)
                        return
                        }

                        try {
                        await createSalesObjective({
                        user_id: userId,
                        month: Number(month),
                        year: Number(year),
                        leads_target: Number(leadsTarget),
                        sales_target: Number(salesTarget),
                        sales_target_type: "amount",
                        sales_target_value: Number(salesTargetValue),
                        })
                        setMessage("Objetivo creado exitosamente")
                        // reset
                        setUserId("")
                        setMonth("")
                        setYear("")
                        setLeadsTarget("")
                        setSalesTarget("")
                        setSalesTargetValue("")
                        } catch (error: any) {
                        console.error(error)
                        setMessage(`Error guardando: ${error.message || "Revisa la consola"}`)
                        } finally {
                        setIsLoading(false)
                        }
                        }

                        const monthNames = [
                        "Enero",
                        "Febrero",
                        "Marzo",
                        "Abril",
                        "Mayo",
                        "Junio",
                        "Julio",
                        "Agosto",
                        "Septiembre",
                        "Octubre",
                        "Noviembre",
                        "Diciembre",
                        ]

                        return (
                        <div className="min-h-screen bg-background flex items-center justify-center p-6">
                            <div className="w-full max-w-5xl mx-auto">
                                <div className="mb-6 text-center">
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Target className="h-6 w-6 text-primary" />
                                        </div>
                                        <h1 className="text-2xl font-semibold text-foreground">Objetivos de Venta</h1>
                                    </div>
                                    <p className="text-muted-foreground">Define metas y objetivos para el equipo de
                                        ventas</p>
                                </div>

                                <div>
                                    <div className="max-w-lg mx-auto">
                                        <Card>
                                            <CardHeader className="border-b border-border/50 pb-4 text-center">
                                                <CardTitle
                                                    className="text-lg font-medium text-foreground flex items-center justify-center gap-2">
                                                    <TrendingUp className="h-5 w-5" />
                                                    Crear Nuevo Objetivo
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="p-6">
                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                    {/* User Selection */}
                                                    <div className="space-y-2 text-center">
                                                        <Label
                                                            className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                                                            <User className="h-4 w-4" />
                                                            Usuario Asignado
                                                        </Label>
                                                        <Select value={userId} onValueChange={setUserId}>
                                                            <SelectTrigger
                                                                className="h-10 border-border/50 focus:border-primary text-center">
                                                                <SelectValue placeholder="Selecciona un usuario..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {users.map((u) => (
                                                                <SelectItem key={u.id} value={u.id}>
                                                                    {u.name}
                                                                </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Period Selection */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2 text-center">
                                                            <Label
                                                                className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                                                                <Calendar className="h-4 w-4" />
                                                                Mes
                                                            </Label>
                                                            <Select value={month.toString()} onValueChange={(value)=>
                                                                setMonth(Number(value))}>
                                                                <SelectTrigger
                                                                    className="h-10 border-border/50 focus:border-primary text-center">
                                                                    <SelectValue placeholder="Selecciona mes..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {monthNames.map((monthName, index) => (
                                                                    <SelectItem key={index + 1} value={(index +
                                                                        1).toString()}>
                                                                        {monthName}
                                                                    </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2 text-center">
                                                            <Label
                                                                className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                                                                <Calendar className="h-4 w-4" />
                                                                Año
                                                            </Label>
                                                            <Input type="number" placeholder="2025" value={year}
                                                                min={2025} max={2050} onChange={(e)=>
                                                            setYear(Number(e.target.value))}
                                                            className="h-10 border-border/50 focus:border-primary text-center"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Targets */}
                                                    <div className="space-y-4">
                                                        <div className="space-y-2 text-center">
                                                            <Label
                                                                className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                                                                <Users className="h-4 w-4" />
                                                                Meta de Leads
                                                            </Label>
                                                            <Input type="number"
                                                                placeholder="Número de leads objetivo..."
                                                                value={leadsTarget} min={1} onChange={(e)=>
                                                            setLeadsTarget(Number(e.target.value))}
                                                            className="h-10 border-border/50 focus:border-primary text-center"
                                                            />
                                                        </div>

                                                        <div className="space-y-2 text-center">
                                                            <Label
                                                                className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                                                                <TrendingUp className="h-4 w-4" />
                                                                Meta de Ventas (Cantidad)
                                                            </Label>
                                                            <Input type="number"
                                                                placeholder="Número de ventas objetivo..."
                                                                value={salesTarget} min={1} onChange={(e)=>
                                                            setSalesTarget(Number(e.target.value))}
                                                            className="h-10 border-border/50 focus:border-primary text-center"
                                                            />
                                                        </div>

                                                        <div className="space-y-2 text-center">
                                                            <Label
                                                                className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                                                                <DollarSign className="h-4 w-4" />
                                                                Meta de Ingresos
                                                            </Label>
                                                            <Input type="number"
                                                                placeholder="Valor monetario objetivo..."
                                                                value={salesTargetValue} min={1} onChange={(e)=>
                                                            setSalesTargetValue(Number(e.target.value))}
                                                            className="h-10 border-border/50 focus:border-primary text-center"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Submit Button */}
                                                    <div className="flex justify-center">
                                                        <Button type="submit" disabled={isLoading || !userId || !month
                                                            || !year || !leadsTarget || !salesTarget ||
                                                            !salesTargetValue}
                                                            className="w-full h-10 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-medium shadow-sm">
                                                            {isLoading ? (
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2">
                                                                </div>
                                                                Creando Objetivo...
                                                            </div>
                                                            ) : (
                                                            "Crear Objetivo de Venta"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </form>

                                                {/* Message Display */}
                                                {message && (
                                                <div className="flex justify-center">
                                                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${
                                                        message.includes("exitosamente")
                                                        ? "bg-green-500/10 border border-green-500/20 text-green-600"
                                                        : "bg-red-500/10 border border-red-500/20 text-red-600" }`}>
                                                        {message.includes("exitosamente") ? (
                                                        <CheckCircle className="h-4 w-4" />
                                                        ) : (
                                                        <AlertCircle className="h-4 w-4" />
                                                        )}
                                                        <p className="font-medium text-sm">{message}</p>
                                                    </div>
                                                </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>


                                </div>
                            </div>
                        </div>
                        )
                        }
