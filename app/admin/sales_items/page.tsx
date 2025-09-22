"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "../../../lib/supabase/client";
import { saveSaleItem } from "../../../lib/supabase/sales_items";
import { ShoppingCart, Package, Users, Calculator, Plus, CheckCircle, AlertCircle } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
}

interface Cliente {
  id: string
  nombre: string
}

export default function SaleItemsPage() {
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedSaleId, setSelectedSaleId] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [message, setMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Cargar productos y ventas existentes
  useEffect(() => {
    const fetchData = async () => {
      const { data: productData, error: prodError } = await supabase.from("products").select("id, name, price")

      const { data: clientesData, error: clientesError } = await supabase.from("clientes").select("id, nombre")

      if (prodError) console.error("Error cargando productos:", prodError)
      if (clientesError) console.error("Error cargando clientes:", clientesError)

      if (productData) setProducts(productData as Product[])
      if (clientesData) setClientes(clientesData as Cliente[])
    }

    fetchData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!selectedSaleId) {
      setMessage("Selecciona una venta existente")
      setIsLoading(false)
      return
    }
    if (!selectedProduct) {
      setMessage("Selecciona un producto")
      setIsLoading(false)
      return
    }
    if (quantity <= 0) {
      setMessage("La cantidad debe ser mayor a 0")
      setIsLoading(false)
      return
    }

    try {
      await saveSaleItem({
        sale_id: selectedSaleId,
        product_id: selectedProduct.id,
        quantity,
        unit_price: selectedProduct.price,
        total_price: selectedProduct.price * quantity,
        client_name: clientes.find((c) => c.id === selectedSaleId)?.nombre || "Desconocido",
      })

      setMessage(`Producto agregado exitosamente a la venta: ${selectedSaleId}`)
      setSelectedProduct(null)
      setQuantity(1)
    } catch (err: any) {
      console.error(err)
      setMessage("Error guardando el producto: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground">Agregar Productos</h1>
          </div>
          <p className="text-muted-foreground">Agrega productos a ventas existentes de manera rápida y sencilla</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Cliente Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4" />
                Cliente con Venta Existente
              </label>
              <select
                value={selectedSaleId}
                onChange={(e) => setSelectedSaleId(e.target.value)}
                className="w-full p-4 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="">Selecciona un cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Package className="h-4 w-4" />
                Producto
              </label>
              <select
                value={selectedProduct?.id || ""}
                onChange={(e) => {
                  const prod = products.find((p) => p.id === e.target.value)
                  setSelectedProduct(prod || null)
                }}
                className="w-full p-4 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="">Selecciona un producto...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calculator className="h-4 w-4" />
                Cantidad
              </label>
              <input
                type="number"
                min={1}
                value={quantity === 0 ? "" : quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-4 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Ingresa la cantidad..."
              />
            </div>

            {/* Total Display */}
            {selectedProduct && quantity > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total a agregar</p>
                    <p className="text-2xl font-semibold text-foreground">
                      ${(selectedProduct.price * quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {quantity} × ${selectedProduct.price.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-primary">{selectedProduct.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !selectedSaleId || !selectedProduct || quantity <= 0}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                  Agregando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Agregar Producto a Venta
                </>
              )}
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                message.includes("exitosamente")
                  ? "bg-green-500/10 border border-green-500/20 text-green-600"
                  : "bg-red-500/10 border border-red-500/20 text-red-600"
              }`}
            >
              {message.includes("exitosamente") ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Productos Disponibles</p>
                <p className="text-2xl font-semibold text-foreground">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas Activas</p>
                <p className="text-2xl font-semibold text-foreground">{clientes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Estimado</p>
                <p className="text-2xl font-semibold text-foreground">
                  ${selectedProduct && quantity > 0 ? (selectedProduct.price * quantity).toLocaleString() : "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
