"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { saveSaleItem } from "../../../lib/supabase/sales_items";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Sale {
  id: string;
  client_name: string;
}

export default function SaleItemsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<string>("");

  // Cargar productos y ventas existentes
  useEffect(() => {
    const fetchData = async () => {
      const { data: productData, error: prodError } = await supabase
        .from("products")
        .select("id, name, price");

      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("client_name");

      if (prodError) console.error("Error cargando productos:", prodError);
      if (salesError) console.error("Error cargando ventas:", salesError);

      if (productData) setProducts(productData as Product[]);
      if (salesData) setSales(salesData as Sale[]);
    };

    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSaleId) {
      setMessage("Selecciona una venta existente");
      return;
    }
    if (!selectedProduct) {
      setMessage("Selecciona un producto");
      return;
    }
    if (quantity <= 0) {
      setMessage("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      await saveSaleItem({
        sale_id: selectedSaleId,
        product_id: selectedProduct.id,
        quantity,
        unit_price: selectedProduct.price,
        total_price: selectedProduct.price * quantity,
        client_name: sales.find(s => s.id === selectedSaleId)?.client_name || "Desconocido",
      });

      setMessage(`Producto agregado exitosamente a la venta: ${selectedSaleId}`);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (err: any) {
      console.error(err);
      setMessage("Error guardando el producto: " + err.message);
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto my-8  bg-white shadow-lg rounded-lg"> 
      <h1 className="text-2xl font-bold mb-4 text-center">Agregar productos a ventas existentes</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <select
          value={selectedSaleId}
          onChange={(e) => setSelectedSaleId(e.target.value)}
          className="w-full p-1 border rounded"
        >
          <option value="">-- Selecciona el nombre de un cliente con una venta ya existente --</option>
          {sales.map((s) => (
            <option key={s.client_name} value={s.client_name}>
              {s.client_name.slice()}
            </option>
          ))}
        </select>

        <select
          value={selectedProduct?.id || ""}
          onChange={(e) => {
            const prod = products.find((p) => p.id === e.target.value);
            setSelectedProduct(prod || null);
          }}
          className="w-full p-1 border rounded"
        >
          <option value="">-- Selecciona un producto --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - ${p.price}
            </option>
          ))}
        </select>

        <input
          type = "number"
          min={1}
          value={quantity === 0 ? "" : quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-1 border rounded"
          placeholder="Cantidad de producto(s)"
        />

        {selectedProduct && (
          <p>Total: ${selectedProduct.price * quantity}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Agregar Item
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-gray-700 font-semibold">{message}</p>
      )}
    </div>
  );
}
