"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Package, Plus, Edit, Trash2, X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Product {
  id?: string
  name: string
  description?: string | null
  price: number
  stock_quantity?: number | null
  category?: string | null
  is_active?: boolean | null
  created_at?: string
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}

function formatDate(date?: string) {
  if (!date) return ""
  return new Date(date).toLocaleDateString()
}

function getStockColor(stock?: number | null) {
  if (stock === null || stock === undefined) return "text-gray-400"
  if (stock === 0) return "text-red-600"
  if (stock < 10) return "text-yellow-600"
  return "text-green-600"
}

const initialForm: Product = {
  name: "",
  description: "",
  price: 0,
  stock_quantity: 0,
  category: "",
  is_active: true,
}

export default function ProductsListPage() {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Product>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Product>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("products").select("*")
      if (error) throw error
      if (data) setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Agregar o editar producto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    try {
      if (editingId) {
        // Editar
        const { error } = await supabase.from("products").update(form).eq("id", editingId)
        if (error) throw error
      } else {
        // Agregar
        const { error } = await supabase.from("products").insert([form])
        if (error) throw error
      }
      setShowForm(false)
      setForm(initialForm)
      setEditingId(null)
      fetchProductos()
      toast.success("Registro exitoso")
    } catch (error) {
      alert("Error al guardar el producto")
    }
  }

  // Eliminar producto
  const handleDelete = async () => {
    if (!productToDelete?.id) return
    const supabase = createClient()
    try {
      const { error } = await supabase.from("products").delete().eq("id", productToDelete.id)
      if (error) throw error
      fetchProductos()
      toast.success("Producto eliminado correctamente")
    } catch (error) {
      alert("Error al eliminar el producto")
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  // Editar producto (cargar datos en el formulario)
  const handleEdit = (product: Product) => {
    setForm(product)
    setEditingId(product.id ?? null)
    setShowForm(true)
  }

  // Mostrar formulario vacío para agregar
  const handleAdd = () => {
    setForm(initialForm)
    setEditingId(null)
    setShowForm(true)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )

  const startEditing = (product: Product) => {
    setEditingId(product.id ?? null)
    setEditingData({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stock_quantity: product.stock_quantity ?? 0,
      category: product.category ?? "",
      is_active: product.is_active ?? true,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData({})
  }

  const saveEdit = async (id?: string) => {
    if (!id) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("products").update(editingData).eq("id", id)

      if (error) throw error

      toast.success("Producto actualizado correctamente")
      setEditingId(null)
      setEditingData({})
      fetchProductos()
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast.error("Error al actualizar producto")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Productos</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Registro y administración de productos</p>
            </div>
            <Button size="sm" onClick={() => setOpen(true)} className="h-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla de datos */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden dark:border dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Productos Registrados
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay productos</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No se encontraron productos con ese término de búsqueda"
                  : "Agrega tu primer producto para comenzar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-12">
                      {/* Nombre */}
                      <td className="px-6 py-2">
                        {editingId === product.id ? (
                          <Input
                            value={editingData.name || ""}
                            onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="text-sm dark:text-white">{product.name}</span>
                        )}
                      </td>
                      {/* Categoría */}
                      <td className="px-6 py-2">
                        {editingId === product.id ? (
                          <Input
                            value={editingData.category || ""}
                            onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="text-sm dark:text-white">{product.category}</span>
                        )}
                      </td>
                      {/* Precio */}
                      <td className="px-6 py-2">
                        {editingId === product.id ? (
                          <Input
                            type="number"
                            value={editingData.price ?? 0}
                            onChange={(e) =>
                              setEditingData({ ...editingData, price: Number.parseFloat(e.target.value) })
                            }
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="text-sm dark:text-white">{formatPrice(product.price)}</span>
                        )}
                      </td>
                      {/* Stock */}
                      <td className="px-6 py-2">
                        {editingId === product.id ? (
                          <Input
                            type="number"
                            value={editingData.stock_quantity ?? 0}
                            onChange={(e) =>
                              setEditingData({ ...editingData, stock_quantity: Number.parseInt(e.target.value) })
                            }
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className={`text-sm ${getStockColor(product.stock_quantity)}`}>
                            {product.stock_quantity ?? 0} unidades
                          </span>
                        )}
                      </td>
                      {/* Estado */}
                      <td className="px-6 py-2">
                        {editingId === product.id ? (
                          <select
                            value={editingData.is_active ? "activo" : "inactivo"}
                            onChange={(e) => setEditingData({ ...editingData, is_active: e.target.value === "activo" })}
                            className="h-7 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {product.is_active ? "Activo" : "Inactivo"}
                          </span>
                        )}
                      </td>
                      {/* Fecha */}
                      <td className="px-6 py-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(product.created_at)}
                        </span>
                      </td>
                      {/* Acciones */}
                      <td className="px-6 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          {editingId === product.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => saveEdit(product.id)}
                                className="h-7 w-7 p-0"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                className="h-7 w-7 p-0 bg-transparent"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(product)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setProductToDelete(product)
                                  setDeleteDialogOpen(true)
                                }}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Mostrando {filteredProducts.length} de {products.length} productos
              </span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Activos: {products.filter((p) => p.is_active).length}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Inactivos: {products.filter((p) => !p.is_active).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulario de registro de productos */}
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogContent className="max-w-md">
          <div>
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="text-center border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {editingId ? "Editar Producto" : "Registro de Producto"}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {editingId ? "Edita la información del producto" : "Agrega un nuevo producto al sistema"}
                </p>
              </CardHeader>

              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Nombre del producto"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="pl-3 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Descripción"
                      value={form.description ?? ""}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="pl-3 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Categoría"
                      value={form.category ?? ""}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="pl-3 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Precio"
                      value={form.price}
                      min={0}
                      step="0.01"
                      onChange={(e) => setForm({ ...form, price: Number.parseFloat(e.target.value) })}
                      className="pl-3 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={form.stock_quantity ?? 0}
                      min={0}
                      onChange={(e) => setForm({ ...form, stock_quantity: Number.parseInt(e.target.value) })}
                      className="pl-3 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active ?? true}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="accent-blue-600"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-700">
                      {form.is_active ? "Activo" : "Inactivo"}
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="h-9 px-4 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {editingId ? "Actualizar Producto" : "Registrar Producto"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogo de confirmación para eliminar producto */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="text-center border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Eliminar producto</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                ¿Estás seguro que deseas eliminar <span className="font-semibold">{productToDelete?.name}</span>? Esta
                acción no se puede deshacer.
              </p>
            </CardHeader>
            <CardContent className="p-4 flex justify-center gap-2">
              <Button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="h-9 px-4 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                className="h-9 px-4 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}