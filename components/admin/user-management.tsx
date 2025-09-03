"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Shield, Clock } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  type UserProfile,
  type UserRole,
  type UserStatus,
} from "@/lib/auth/rbac-client"
import type { Database } from "@/lib/supabase/types"

interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string | null
  record_id: string | null
  old_values: any
  new_values: any
  created_at: string
  user_agent: string | null
  ip_address: string | null
  user_profiles: {
    email: string
    full_name: string
  }
}

const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function logAudit(action: string, tableName: string, recordId: string, oldValues: any, newValues: any) {
  if (typeof window === "undefined") return

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const userAgent = navigator.userAgent

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
      user_agent: userAgent,
    })
  } catch (error) {
    console.error("Error logging audit:", error)
  }
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const { toast } = useToast()

  // Form states
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserFullName, setNewUserFullName] = useState("")
  const [newUserRole, setNewUserRole] = useState<UserRole>("vendeur")
  const [editUserRole, setEditUserRole] = useState<UserRole>("vendeur")
  const [editUserStatus, setEditUserStatus] = useState<UserStatus>("active")

  useEffect(() => {
    loadUsers()
    loadAuditLogs()
  }, [])

  async function loadUsers() {
    try {
      const userList = await getAllUsers()
      setUsers(userList)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadAuditLogs() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          id,
          user_id,
          action,
          table_name,
          record_id,
          old_values,
          new_values,
          created_at,
          user_agent,
          ip_address,
          user_profiles!inner(
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error

      const auditLogsWithUsers = (data || []).map((log) => ({
        ...log,
        user_email: log.user_profiles?.full_name || log.user_profiles?.email || "Utilisateur inconnu",
      }))

      setAuditLogs(auditLogsWithUsers as any)
    } catch (error) {
      console.error("Error loading audit logs:", error)
    }
  }

  async function createUser() {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          email: newUserEmail,
          full_name: newUserFullName,
          role: newUserRole,
          status: "pending", // Admin-created users start as pending
        })
        .select()
        .single()

      if (error) throw error

      await logAudit("CREATE_USER", "user_roles", data.id, null, {
        email: newUserEmail,
        role: newUserRole,
      })

      toast({
        title: "Utilisateur créé",
        description: `L'utilisateur ${newUserEmail} a été créé avec succès`,
      })

      setNewUserEmail("")
      setNewUserFullName("")
      setNewUserRole("vendeur")
      setIsCreateDialogOpen(false)
      loadUsers()
      loadAuditLogs()
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur",
        variant: "destructive",
      })
    }
  }

  async function updateUser() {
    if (!selectedUser) return

    try {
      const oldValues = { role: selectedUser.role, status: selectedUser.status }

      if (editUserRole !== selectedUser.role) {
        const success = await updateUserRole(selectedUser.user_id, editUserRole)
        if (!success) throw new Error("Failed to update role")
      }

      if (editUserStatus !== selectedUser.status) {
        const success = await updateUserStatus(selectedUser.user_id, editUserStatus)
        if (!success) throw new Error("Failed to update status")
      }

      await logAudit("UPDATE_USER", "user_roles", selectedUser.id, oldValues, {
        role: editUserRole,
        status: editUserStatus,
      })

      toast({
        title: "Utilisateur mis à jour",
        description: `L'utilisateur ${selectedUser.email} a été mis à jour`,
      })

      setIsEditDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
      loadAuditLogs()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur",
        variant: "destructive",
      })
    }
  }

  function openEditDialog(user: UserProfile) {
    setSelectedUser(user)
    setEditUserRole(user.role)
    setEditUserStatus(user.status)
    setIsEditDialogOpen(true)
  }

  function getRoleBadgeVariant(role: UserRole) {
    switch (role) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      case "vendeur":
        return "secondary"
      default:
        return "outline"
    }
  }

  function getStatusBadgeVariant(status: UserStatus) {
    switch (status) {
      case "active":
        return "default"
      case "suspended":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="audit">Journal d'Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Utilisateurs du Système</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un Nouvel Utilisateur</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau profil utilisateur. L'utilisateur devra s'inscrire séparément.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="utilisateur@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nom Complet</Label>
                    <Input
                      id="fullName"
                      value={newUserFullName}
                      onChange={(e) => setNewUserFullName(e.target.value)}
                      placeholder="Nom Prénom"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendeur">Vendeur</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createUser} disabled={!newUserEmail}>
                    Créer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des Utilisateurs</CardTitle>
              <CardDescription>Gérez les rôles et statuts des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || "Non défini"}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Journal d'Audit
              </CardTitle>
              <CardDescription>Historique des actions importantes dans le système</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {new Date(log.created_at).toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell>{log.user_profiles?.full_name || log.user_profiles?.email || "Système"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.table_name || "N/A"}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {log.new_values && typeof log.new_values === "object" && (
                            <div className="text-sm">
                              <span className="font-medium">Nouveau:</span>{" "}
                              {Object.entries(log.new_values)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </div>
                          )}
                          {log.old_values && typeof log.old_values === "object" && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Ancien:</span>{" "}
                              {Object.entries(log.old_values)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {auditLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucune entrée d'audit trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'Utilisateur</DialogTitle>
            <DialogDescription>Modifiez le rôle et le statut de {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editRole">Rôle</Label>
              <Select value={editUserRole} onValueChange={(value: UserRole) => setEditUserRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendeur">Vendeur</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editStatus">Statut</Label>
              <Select value={editUserStatus} onValueChange={(value: UserStatus) => setEditUserStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="pending">En Attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={updateUser}>Mettre à Jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
