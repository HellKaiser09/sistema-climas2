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
        .select("id");

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
      });

      setMessage(`Item agregado con id: ${selectedSaleId}`);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (err: any) {
      console.error(err);
      setMessage("Error guardando el item: " + err.message);
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto bg-white shadow-lg rounded-lg"> 
      <h1 className="text-2xl font-bold mb-4 text-center">Agregar Items a Ventas</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <select
          value={selectedSaleId}
          onChange={(e) => setSelectedSaleId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Selecciona una venta existente --</option>
          {sales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id.slice(0, 8)}…
            </option>
          ))}
        </select>

        <select
          value={selectedProduct?.id || ""}
          onChange={(e) => {
            const prod = products.find((p) => p.id === e.target.value);
            setSelectedProduct(prod || null);
          }}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Selecciona un producto --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - ${p.price}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-2 border rounded"
          placeholder="Cantidad"
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
