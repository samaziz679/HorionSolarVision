-- Clean up existing conflicting policies and implement simplified RBAC
-- Roles: admin, manager, vendeur

-- Drop all existing policies to start clean
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Create helper functions for RBAC
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role::TEXT 
        FROM user_roles 
        WHERE user_id = user_uuid 
        AND status = 'active'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_uuid) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_manager_or_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_uuid) IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_access_module(user_uuid UUID, module_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := get_user_role(user_uuid);
    
    -- Admin can access everything
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Manager can access everything except user management
    IF user_role = 'manager' THEN
        RETURN module_name != 'user_management';
    END IF;
    
    -- Vendeur can only access dashboard, sales, and clients
    IF user_role = 'vendeur' THEN
        RETURN module_name IN ('dashboard', 'sales', 'clients');
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User Roles Policies
CREATE POLICY "Admins can manage all user roles" ON user_roles
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

-- Clients Policies (Vendeur can access)
CREATE POLICY "All authenticated users can view clients" ON clients
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Vendeur, Manager, Admin can create clients" ON clients
    FOR INSERT WITH CHECK (can_access_module(auth.uid(), 'clients'));

CREATE POLICY "Manager and Admin can update clients" ON clients
    FOR UPDATE USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "Only Admin can delete clients" ON clients
    FOR DELETE USING (is_admin(auth.uid()));

-- Products Policies (Manager and Admin only)
CREATE POLICY "All authenticated users can view products" ON products
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Manager and Admin can manage products" ON products
    FOR ALL USING (is_manager_or_admin(auth.uid()));

-- Sales Policies (Vendeur can access)
CREATE POLICY "All authenticated users can view sales" ON sales
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Vendeur, Manager, Admin can create sales" ON sales
    FOR INSERT WITH CHECK (can_access_module(auth.uid(), 'sales'));

CREATE POLICY "Only Admin can update sales" ON sales
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only Admin can delete sales" ON sales
    FOR DELETE USING (is_admin(auth.uid()));

-- Purchases Policies (Manager and Admin only)
CREATE POLICY "Manager and Admin can view purchases" ON purchases
    FOR SELECT USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "Manager and Admin can manage purchases" ON purchases
    FOR ALL USING (is_manager_or_admin(auth.uid()));

-- Suppliers Policies (Manager and Admin only)
CREATE POLICY "Manager and Admin can view suppliers" ON suppliers
    FOR SELECT USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "Manager and Admin can manage suppliers" ON suppliers
    FOR ALL USING (is_manager_or_admin(auth.uid()));

-- Expenses Policies (Manager and Admin only)
CREATE POLICY "Manager and Admin can view expenses" ON expenses
    FOR SELECT USING (is_manager_or_admin(auth.uid()));

CREATE POLICY "Manager and Admin can manage expenses" ON expenses
    FOR ALL USING (is_manager_or_admin(auth.uid()));

-- Expense Categories Policies
CREATE POLICY "All authenticated users can view expense categories" ON expense_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Manager and Admin can manage expense categories" ON expense_categories
    FOR ALL USING (is_manager_or_admin(auth.uid()));

-- Audit Logs Policies
CREATE POLICY "Only Admin can view audit logs" ON audit_logs
    FOR SELECT USING (is_admin(auth.uid()));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
