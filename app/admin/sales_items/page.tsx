"use client"

import { useState, useEffect } from "react"
import { createClient } from "../../../lib/supabase/client"
import { saveSaleItem } from "../../../lib/supabase/sales_items"
import {
  ShoppingCart,
  Package,
  Users,
  Calculator,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Product {
  id: string
  name: string
  price: number
}

interface Cliente {
  id: string
  nombre: string
}
interface Sale{
  id: string
  client_name: string      
  service_date: string     
  created_at: string
  total_amount: number
  status: string
}
export default function SaleItemsPage() {
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [sales,setSales] = useState<Sale[]>([])
  const [saleItems, setSaleItems] = useState<any[]>([])
  const [selectedSaleId, setSelectedSaleId] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [message, setMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Cargar ventas
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("id, client_name, service_date, created_at, total_amount, status")
      if (salesError) console.error("Error cargando ventas:", salesError)
      if (salesData) {
        setSales(salesData)
      }

      // Cargar productos
      const { data: productData, error: prodError } = await supabase
        .from("products")
        .select("id, name, price")
      if (prodError) console.error("Error cargando productos:", prodError)
      if (productData) setProducts(productData as Product[])

      // Cargar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nombre")
      if (clientesError) console.error("Error cargando clientes:", clientesError)
      if (clientesData) setClientes(clientesData as Cliente[])

      // Cargar items de venta
      const { data: saleItemsData, error: saleItemsError } = await supabase
        .from("sale_items")
        .select("id, sale_id, product_id, quantity, unit_price, total_price, product:products(name)")
      if (saleItemsError) console.error("Error cargando items de venta:", saleItemsError)
      if (saleItemsData) setSaleItems(saleItemsData)
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
      })
      setMessage(`Producto agregado exitosamente a la venta: ${selectedSaleId}`)
      setSelectedProduct(null)
      setQuantity(1)
      setOpen(false)
    } catch (err: any) {
      console.error(err)
      setMessage("Error guardando el producto: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Agregar Productos a Venta
              </h1>
              <p className="text-sm text-muted-foreground">
                Agrega productos a ventas existentes de manera rápida y sencilla
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium text-foreground">
            Productos Disponibles ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="font-medium text-muted-foreground">
                  Producto
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Precio
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="py-4 font-medium text-foreground">
                    {product.name}
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    ${product.price.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border/50">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-primary" />
              </div>
              {/* ✅ Aquí van los de Radix */}
              <DialogTitle className="text-xl font-semibold text-foreground">
                Agregar Producto a Venta
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                Selecciona el cliente, producto y cantidad
              </DialogDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  {/* Cliente */}
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <select
                      value={selectedSaleId}
                      onChange={(e) => setSelectedSaleId(e.target.value)}
                      className="w-full pl-10 h-11 border-border/50 focus:border-primary bg-background text-foreground rounded-lg"
                      required
                    >
                      <option value="">Selecciona un cliente...</option>
                      {sales.map((Sale) => (
                        <option key={Sale.id} value={Sale.id}>
                          {Sale.client_name.slice()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Producto */}
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <select
                      value={selectedProduct?.id || ""}
                      onChange={(e) => {
                        const prod = products.find(
                          (p) => p.id === e.target.value
                        )
                        setSelectedProduct(prod || null)
                      }}
                      className="w-full pl-10 h-11 border-border/50 focus:border-primary bg-background text-foreground rounded-lg"
                      required
                    >
                      <option value="">Selecciona un producto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${p.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cantidad */}
                  <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="number"
                      min={1}
                      value={quantity === 0 ? "" : quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="pl-10 h-11 border-border/50 focus:border-primary bg-background"
                      placeholder="Cantidad"
                      required
                    />
                  </div>
                </div>

                {/* Total */}
                {selectedProduct && quantity > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total a agregar
                        </p>
                        <p className="text-2xl font-semibold text-foreground">
                          ${(selectedProduct.price * quantity).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {quantity} × ${selectedProduct.price.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {selectedProduct.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                      Agregando...
                    </div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Producto a Venta
                    </>
                  )}
                </Button>
              </form>

              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-sm ${
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
                  <span>{message}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Tabla de ventas con productos */}
      <Card className="border-border/50 shadow-sm mt-8">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium text-foreground">
            Ventas Registradas ({sales.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="font-medium text-muted-foreground">Cliente</TableHead>
                <TableHead className="font-medium text-muted-foreground">Fecha</TableHead>
                <TableHead className="font-medium text-muted-foreground">Producto</TableHead>
                <TableHead className="font-medium text-muted-foreground">Cantidad</TableHead>
                <TableHead className="font-medium text-muted-foreground">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleItems.map((item) => {
                const sale = sales.find(s => s.id === item.sale_id)
                return (
                  <TableRow key={item.id} className="border-border/50">
                    <TableCell className="py-4 font-medium text-foreground">
                      {sale?.client_name || "Sin cliente"}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {sale?.service_date || ""}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {item.product?.name || ""}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      ${item.total_price.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
