export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          description: string
          category: string
          amount: number
          expense_date: string
          created_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          description: string
          category: string
          amount: number
          expense_date?: string
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          description?: string
          category?: string
          amount?: number
          expense_date?: string
          created_by?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          type: string | null
          quantity: number
          prix_achat: number
          prix_vente_detail_1: number
          prix_vente_detail_2: number
          prix_vente_gros: number
          seuil_stock_bas: number
          created_at: string
          updated_at: string
          created_by: string | null
          unit: string | null
          description: string | null
          image: string | null
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          quantity?: number
          prix_achat?: number
          prix_vente_detail_1?: number
          prix_vente_detail_2?: number
          prix_vente_gros?: number
          seuil_stock_bas?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          unit?: string | null
          description?: string | null
          image?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          quantity?: number
          prix_achat?: number
          prix_vente_detail_1?: number
          prix_vente_detail_2?: number
          prix_vente_gros?: number
          seuil_stock_bas?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          unit?: string | null
          description?: string | null
          image?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          id: string
          product_id: string | null
          supplier_id: string | null
          quantity: number
          unit_price: number
          total: number
          purchase_date: string
          created_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          supplier_id?: string | null
          quantity: number
          unit_price: number
          total: number
          purchase_date?: string
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          supplier_id?: string | null
          quantity?: number
          unit_price?: number
          total?: number
          purchase_date?: string
          created_by?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          id: string
          product_id: string | null
          client_id: string | null
          quantity: number
          price_plan: string
          unit_price: number
          total: number
          sale_date: string
          created_by: string | null
          notes: string | null
          quantity_sold: number
          total_price: number
        }
        Insert: {
          id?: string
          product_id?: string | null
          client_id?: string | null
          quantity: number
          price_plan: string
          unit_price: number
          total: number
          sale_date?: string
          created_by?: string | null
          notes?: string | null
          quantity_sold?: number
          total_price?: number
        }
        Update: {
          id?: string
          product_id?: string | null
          client_id?: string | null
          quantity?: number
          price_plan?: string
          unit_price?: number
          total?: number
          sale_date?: string
          created_by?: string | null
          notes?: string | null
          quantity_sold?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type Product = Tables<"products">
export type Client = Tables<"clients">
export type Sale = Tables<"sales">
export type Supplier = Tables<"suppliers">
export type Purchase = Tables<"purchases">
export type Expense = Tables<"expenses">

// Adding missing SaleItem type for compatibility
export type SaleItem = {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
  products?: Product | null
}

export type SaleWithDetails = Sale & {
  clients: Client | null
  products: Product | null
}

// Adding missing SaleWithItems export
export type SaleWithItems = Sale & {
  sale_items: SaleItem[]
  clients: Client | null
}

export type PurchaseWithDetails = Purchase & {
  suppliers: Supplier | null
  products: Product | null
}

// Adding missing PurchaseWithItems export
export type PurchaseWithItems = PurchaseWithDetails
