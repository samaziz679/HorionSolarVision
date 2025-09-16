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
import { Plus, Edit, Shield, Clock, UserPlus, UserCheck, AlertCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getPendingUsers,
  activateUser,
  logAudit,
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

interface PendingUser {
  id: string
  email: string
  created_at: string
}

const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

const AVAILABLE_ROLES = ["admin", "stock_manager", "commercial", "finance", "visitor", "seller"] as const
type AvailableRole = (typeof AVAILABLE_ROLES)[number]

export function UserManagement({ initialSetup = false }: { initialSetup?: boolean }) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null)
  const { toast } = useToast()

  // Form states - Using English role values directly
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserFullName, setNewUserFullName] = useState("")
  const [newUserRole, setNewUserRole] = useState<AvailableRole>("seller")
  const [editUserRole, setEditUserRole] = useState<AvailableRole>("seller")
  const [editUserStatus, setEditUserStatus] = useState<UserStatus>("active")
  const [activateUserFullName, setActivateUserFullName] = useState("")
  const [activateUserRole, setActivateUserRole] = useState<AvailableRole>("seller")

  useEffect(() => {
    loadUsers()
    loadAuditLogs()
    loadPendingUsers()
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

  async function loadPendingUsers() {
    try {
      console.log("[v0] Loading pending users...")
      const pendingUserList = await getPendingUsers()
      console.log("[v0] Pending users loaded:", pendingUserList)
      setPendingUsers(pendingUserList)
    } catch (error) {
      console.error("[v0] Error loading pending users:", error)
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

  async function activatePendingUser() {
    if (!selectedPendingUser) return

    try {
      console.log("[v0] Activating user:", selectedPendingUser.email, "with role:", activateUserRole)

      const success = await activateUser(
        selectedPendingUser.id,
        selectedPendingUser.email,
        activateUserFullName,
        activateUserRole, // Using English role directly
      )

      if (!success) {
        throw new Error("Failed to activate user")
      }

      await logAudit("ACTIVATE_USER", "user_profiles", selectedPendingUser.id, null, {
        email: selectedPendingUser.email,
        full_name: activateUserFullName,
        role: activateUserRole,
        status: "active",
      })

      toast({
        title: "Utilisateur activé",
        description: `L'utilisateur ${selectedPendingUser.email} a été activé avec succès`,
      })

      setIsActivateDialogOpen(false)
      setSelectedPendingUser(null)
      setActivateUserFullName("")
      setActivateUserRole("seller")

      // Reload both lists
      loadUsers()
      loadPendingUsers()
      loadAuditLogs()
    } catch (error) {
      console.error("[v0] Error activating user:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'activer l'utilisateur",
        variant: "destructive",
      })
    }
  }

  function openActivateDialog(pendingUser: PendingUser) {
    setSelectedPendingUser(pendingUser)
    setActivateUserFullName(pendingUser.email.split("@")[0]) // Default name from email
    setActivateUserRole("seller")
    setIsActivateDialogOpen(true)
  }

  function openEditDialog(user: UserProfile) {
    setSelectedUser(user)
    setEditUserRole(user.role as AvailableRole)
    setEditUserStatus(user.status)
    setIsEditDialogOpen(true)
  }

  function getRoleBadgeVariant(role: UserRole) {
    switch (role) {
      case "admin":
        return "destructive"
      case "stock_manager":
        return "default"
      case "seller":
        return "secondary"
      case "commercial":
        return "default"
      case "finance":
        return "secondary"
      case "visitor":
        return "outline"
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

  if (initialSetup) {
    return (
      <div className="space-y-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <UserPlus className="h-5 w-5" />
              Configuration Initiale Requise
            </CardTitle>
            <CardDescription className="text-orange-700">
              Aucun administrateur n'existe dans le système. Créez votre compte administrateur pour commencer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="adminEmail">Votre Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="admin@votre-entreprise.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminName">Votre Nom Complet</Label>
                <Input
                  id="adminName"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  placeholder="Votre Nom Complet"
                />
              </div>
            </div>
            <Button
              onClick={() => createUser(true, newUserEmail, newUserFullName, newUserRole)}
              disabled={!newUserEmail || !newUserFullName}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Créer Mon Compte Administrateur
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Utilisateurs en Attente
            {pendingUsers.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingUsers.length}
              </Badge>
            )}
          </TabsTrigger>
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
                    <Select value={newUserRole} onValueChange={(value: AvailableRole) => setNewUserRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={() => createUser(false, newUserEmail, newUserFullName, newUserRole)}
                    disabled={!newUserEmail}
                  >
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

        <TabsContent value="pending" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Utilisateurs en Attente d'Activation</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Comptes en Attente
              </CardTitle>
              <CardDescription>
                Ces utilisateurs se sont inscrits mais n'ont pas encore été activés par un administrateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aucun utilisateur en attente d'activation</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((pendingUser) => (
                      <TableRow key={pendingUser.id}>
                        <TableCell className="font-medium">{pendingUser.email}</TableCell>
                        <TableCell>{new Date(pendingUser.created_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActivateDialog(pendingUser)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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

      {/* Activate User Dialog - Simplified role selection */}
      <Dialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activer l'Utilisateur</DialogTitle>
            <DialogDescription>
              Activez le compte de {selectedPendingUser?.email} et assignez-lui un rôle
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="activateFullName">Nom Complet</Label>
              <Input
                id="activateFullName"
                value={activateUserFullName}
                onChange={(e) => setActivateUserFullName(e.target.value)}
                placeholder="Nom Prénom"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activateRole">Rôle</Label>
              <Select value={activateUserRole} onValueChange={(value: AvailableRole) => setActivateUserRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={activatePendingUser} disabled={!activateUserFullName}>
              <UserCheck className="h-4 w-4 mr-2" />
              Activer l'Utilisateur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

async function createUser(
  initialSetup: boolean,
  newUserEmail: string,
  newUserFullName: string,
  newUserRole: AvailableRole,
) {
  try {
    const supabase = createClient()

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("user_roles")
      .insert({
        user_id: initialSetup && currentUser ? currentUser.id : undefined,
        email: newUserEmail,
        full_name: newUserFullName,
        role: initialSetup ? "admin" : newUserRole, // Using database role values
        status: initialSetup ? "active" : "pending",
      })
      .select()
      .single()

    if (error) throw error
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      message: "Impossible de créer l'utilisateur",
    }
  }
}

async function updateUser(selectedUser: UserProfile, editUserRole: AvailableRole, editUserStatus: UserStatus) {
  if (!selectedUser) return { success: false, message: "Aucun utilisateur sélectionné" }

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

    return {
      success: true,
      message: `L'utilisateur ${selectedUser.email} a été mis à jour`,
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return {
      success: false,
      message: "Impossible de mettre à jour l'utilisateur",
    }
  }
}
