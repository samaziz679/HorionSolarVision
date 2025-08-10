export type Json = string | number | boolean | null |
\
{
  [key: string]
  : Json | undefined \
}
| Json[]

export type Database =
\
{
  public:
  \
  Tables:
  \
  banking:
  \
  Row:
  \
  account_holder: string | null
  account_number: string | null
  bank_name: string | null
  branch_name: string | null
  created_at: string
  id: number
  initial_balance: number | null
  user_id: string | null
  \
  Insert:
  \
  \
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          branch_name?: string | null
          created_at?: string
          id?: number
          initial_balance?: number | null
          user_id?: string | null
        \
  Update:
  \
  \
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          branch_name?: string | null
          created_at?: string
          id?: number
          initial_balance?: number | null
          user_id?: string | null
        \
  Relationships: [\
          \{
            foreignKeyName: "banking_user_id_fkey"\
            columns: ["user_id"]\
            isOneToOne: false\
            referencedRelation: "users"\
            referencedColumns: ["id"]\
          \},
        ]
  \
  clients:
  \
  Row:
  \
  address: string | null
  created_at: string
  email: string | null
  first_name: string
  id: number
  last_name: string
  phone_number: string | null
  user_id: string | null
  \
  Insert:
  \
  \
          address?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: number
          last_name: string
          phone_number?: string | null
          user_id?: string | null
        \
  Update:
  \
  \
          address?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: number
          last_name?: string
          phone_number?: string | null
          user_id?: string | null
        \
  Relationships: [\
          \{
            foreignKeyName: "clients_user_id_fkey"\
            columns: ["user_id"]\
            isOneToOne: false\
            referencedRelation: "users"\
            referencedColumns: ["id"]\
          \},
        ]
  \
  expenses:
  \
  Row:
  \
  amount: number
  category: string | null
  created_at: string
  date: string
  description: string | null
  id: number
  user_id: string | null
  \
  Insert:
  \
  amount: number
  \
          category?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: number
          user_id?: string | null
        \
  Update:
  \
  \
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: number
          user_id?: string | null
        \
  Relationships: [\
          \{
            foreignKeyName: "expenses_user_id_fkey"\
            columns: ["user_id"]\
            isOneToOne: false\
            referencedRelation: "users"\
            referencedColumns: ["id"]\
          \},
        ]
  \
  products:
  \
  Row:
  \
  category: string | null
  created_at: string
  description: string | null
  id: number
  name: string
  prix_achat_ht: number | null
  prix_vente_detail_1: number | null
  prix_vente_gros_1: number | null
  stock_quantity: number
  supplier_id: number | null
  tva: number | null
  user_id: string | null
  \
  Insert:
  \
  \
          category?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
          prix_achat_ht?: number | null
          prix_vente_detail_1?: number | null
          prix_vente_gros_1?: number | null
          stock_quantity: number
          supplier_id?: number | null
          tva?: number | null
          user_id?: string | null
        \
  Update:
  \
  \
          category?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          prix_achat_ht?: number | null
          prix_vente_detail_1?: number | null
          prix_vente_gros_1?: number | null
          stock_quantity?: number
          supplier_id?: number | null
          tva?: number | null
          user_id?: string | null
        \
  Relationships: [\
          \{
            foreignKeyName: "products_supplier_id_fkey"\
            columns: ["supplier_id"]\
            isOneToOne: false\
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          \},
          \{
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          \},
        ]
  \
  purchases:
  \
  Row:
  \
  created_at: string
  date: string
  id: number
  product_id: number
  quantity: number
  supplier_id: number
  total_cost: number
  user_id: string | null
  \
  Insert:
  \
  created_at?: string
  date: string
  id?: number
  product_id: number
  quantity: number
  supplier_id: number
  total_cost: number
  user_id?: string | null
  \
  Update:
  \
  created_at?: string
  date?: string
  id?: number
  product_id?: number
  quantity?: number
  supplier_id?: number
  total_cost?: number
  user_id?: string | null
  \
  Relationships: [
          \{
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          \},
          \{
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          \},
          \{
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          \},
        ]
  \
  sale_items:
  \
  Row:
  \
  created_at: string
  id: number
  product_id: number
  quantity: number
  sale_id: number
  unit_price: number
  user_id: string | null
  \
  Insert:
  \
  created_at?: string
  id?: number
  product_id: number
  quantity: number
  sale_id: number
  unit_price: number
  user_id?: string | null
  \
  Update:
  \
  created_at?: string
  id?: number
  product_id?: number
  quantity?: number
  sale_id?: number
  unit_price?: number
  user_id?: string | null
  \
  Relationships: [
          \{
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          \},
          \{
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          \},
          \{
            foreignKeyName: "sale_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          \},
        ]
  \
  sales:
  \
  Row:
  \
  client_id: number
  created_at: string
  date: string
  id: number
  total_amount: number
  user_id: string | null
  \
  Insert:
  \
  client_id: number
  created_at?: string
  date: string
  id?: number
  total_amount: number
  user_id?: string | null
  \
  Update:
  \
  client_id?: number
  created_at?: string
  date?: string
  id?: number
  total_amount?: number
  user_id?: string | null
  \
  Relationships: [
          \{
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          \},
          \{
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          \},
        ]
  \
  suppliers:
  \
  Row:
  \
  address: string | null
  contact_person: string | null
  created_at: string
  email: string | null
  id: number
  name: string
  phone_number: string | null
  user_id: string | null
  \
  Insert:
  \
  address?: string | null
  contact_person?: string | null
  created_at?: string
  email?: string | null
  id?: number
  name: string
  phone_number?: string | null
  user_id?: string | null
  \
  Update:
  \
  address?: string | null
  contact_person?: string | null
  created_at?: string
  email?: string | null
  id?: number
  name?: string
  phone_number?: string | null
  user_id?: string | null
  \
  Relationships: [
          \{
            foreignKeyName: "suppliers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          \},
        ]
  \
  \
  Views:
  \
  ;[_ in never]
  : never
    \
  Functions:
  \
  ;[_ in never]
  : never
    \
  Enums:
  \
  ;[_ in never]
  : never
    \
  CompositeTypes:
  \
  ;[_ in never]
  : never
    \
  \
  \
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | \{ schema: keyof Database \},
  TableName extends PublicTableNameOrOptions extends \{ schema: keyof Database \}
? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends \
{
  schema: keyof
  Database
  \
}
? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends \
{
  Row: infer
  R
  \
}
? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends \
{
  Row: infer
  R
  \
}
? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | \{ schema: keyof Database \},
  TableName extends PublicTableNameOrOptions extends \{ schema: keyof Database \}
? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends \
{
  schema: keyof
  Database
  \
}
? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends \
{
  Insert: infer
  I
  \
}
? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends \
{
  Insert: infer
  I
  \
}
? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | \{ schema: keyof Database \},
  TableName extends PublicTableNameOrOptions extends \{ schema: keyof Database \}
? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends \
{
  schema: keyof
  Database
  \
}
? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends \
{
  Update: infer
  U
  \
}
? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends \
{
  Update: infer
  U
  \
}
? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | \{ schema: keyof Database \},
  EnumName extends PublicEnumNameOrOptions extends \{ schema: keyof Database \}
? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends \
{
  schema: keyof
  Database
  \
}
? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Custom types
export type Product = Tables<"products">
export type Client = Tables<"clients">
export type Sale = Tables<"sales">
export type SaleItem = Tables<"sale_items">

export type SaleWithItems = Sale &
\
{
  sale_items: (SaleItem & \
  products: Product | null
  \
  )[]
  \
}
