export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      banking: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          branch: string | null
          created_at: string
          id: string
          initial_balance: number
          type: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          branch?: string | null
          created_at?: string
          id?: string
          initial_balance?: number
          type: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          branch?: string | null
          created_at?: string
          id?: string
          initial_balance?: number
          type?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          cost_price: number
          created_at: string
          id: string
          name: string
          quantity: number
          selling_price: number
          sku: string | null
        }
        Insert: {
          cost_price: number
          created_at?: string
          id?: string
          name: string
          quantity?: number
          selling_price: number
          sku?: string | null
        }
        Update: {
          cost_price?: number
          created_at?: string
          id?: string
          name?: string
          quantity?: number
          selling_price?: number
          sku?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          date: string
          id: string
          product_id: string
          quantity: number
          supplier_id: string
          total_cost: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          product_id: string
          quantity: number
          supplier_id: string
          total_cost: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          product_id?: string
          quantity?: number
          supplier_id?: string
          total_cost?: number
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
          client_id: string
          created_at: string
          date: string
          id: string
          product_id: string
          quantity: number
          total_price: number
        }
        Insert: {
          client_id: string
          created_at?: string
          date: string
          id?: string
          product_id: string
          quantity: number
          total_price: number
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          id?: string
          product_id?: string
          quantity?: number
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
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
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
