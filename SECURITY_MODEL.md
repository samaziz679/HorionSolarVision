# Modèle de Sécurité - Solar Vision ERP

## Vue d'Ensemble

Le système Solar Vision ERP implémente un modèle de sécurité à plusieurs couches pour protéger contre les accès non autorisés et garantir l'intégrité des données.

## Architecture de Sécurité

### 1. Couche d'Authentification (Supabase Auth)
- **Magic Links uniquement** - Pas de mots de passe à retenir ou compromettre
- **Validation d'email obligatoire** - Seuls les emails pré-autorisés peuvent se connecter
- **Sessions sécurisées** - Gestion automatique des tokens et refresh
- **Expiration des liens** - Magic links valides 1 heure maximum

### 2. Couche d'Autorisation (RBAC Custom)
- **Contrôle d'accès basé sur les rôles** (Role-Based Access Control)
- **3 niveaux de rôles** : Admin, Manager, Vendeur
- **Permissions granulaires** par module et action
- **Statuts utilisateur** : Active, Suspended, Pending

### 3. Protection des Données (Row Level Security)
- **RLS activé** sur toutes les tables sensibles
- **Accès basé sur le rôle** et l'authentification
- **Isolation des données** par utilisateur quand approprié
- **Audit complet** de toutes les opérations CRUD

## Flux de Sécurité

### Processus de Connexion
1. **Validation d'email** - Vérification que l'email existe dans `user_roles`
2. **Vérification du statut** - Seuls les utilisateurs "active" peuvent se connecter
3. **Envoi du magic link** - Lien sécurisé envoyé par Supabase
4. **Validation du callback** - Double vérification du profil utilisateur
5. **Création de session** - Session sécurisée établie
6. **Logging d'audit** - Connexion enregistrée dans les logs

### Prévention des Accès Non Autorisés
- **Pas d'auto-inscription** - Impossible de créer un compte sans admin
- **Validation pré-authentification** - Email vérifié avant envoi du magic link
- **Validation post-authentification** - Profil vérifié après authentification
- **Logging des tentatives** - Toutes les tentatives non autorisées enregistrées
- **Déconnexion automatique** - Utilisateurs non valides déconnectés immédiatement

## Rôles et Permissions

### Admin
- **Modules** : Tous (dashboard, inventory, sales, purchases, clients, suppliers, expenses, reports, settings, admin, solar-sizer)
- **Actions** : Toutes (create, read, update, delete, manage_users)
- **Spécial** : Gestion des utilisateurs, accès aux logs d'audit

### Manager  
- **Modules** : Tous sauf admin (dashboard, inventory, sales, purchases, clients, suppliers, expenses, reports, settings, solar-sizer)
- **Actions** : create, read, update, delete
- **Restrictions** : Pas de gestion d'utilisateurs

### Vendeur
- **Modules** : Limités (dashboard, sales, clients)
- **Actions** : create, read uniquement
- **Restrictions** : Pas de modification des ventes existantes

## Audit et Monitoring

### Logs d'Audit
- **Actions trackées** : CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- **Informations capturées** : User ID, action, table, anciennes/nouvelles valeurs, timestamp, IP, user agent
- **Rétention** : Logs permanents pour conformité
- **Accès** : Admins uniquement

### Tentatives Non Autorisées
- **Emails non autorisés** - Tentatives de connexion avec emails non enregistrés
- **Comptes inactifs** - Tentatives de connexion avec comptes suspendus/pending
- **Accès sans profil** - Authentification Supabase sans profil système
- **Violations de permissions** - Tentatives d'accès à des ressources interdites

## Mesures de Protection

### Contre les Attaques Communes
- **Brute Force** : Magic links avec expiration courte
- **Session Hijacking** : Tokens sécurisés gérés par Supabase
- **SQL Injection** : Requêtes paramétrées et RLS
- **XSS** : Validation et échappement des données
- **CSRF** : Tokens CSRF intégrés dans Next.js

### Monitoring Continu
- **Logs d'accès** en temps réel
- **Alertes automatiques** pour tentatives suspectes
- **Audit trail complet** pour investigation
- **Métriques de sécurité** dans le dashboard admin

## Configuration Recommandée

### Variables d'Environnement Critiques
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### Politiques Supabase RLS
- Activées sur toutes les tables métier
- Basées sur `auth.uid()` et rôles utilisateur
- Testées et validées pour chaque rôle

### Bonnes Pratiques
1. **Premier Admin** : Créé manuellement en base après déploiement
2. **Rotation des clés** : Service role key changée régulièrement
3. **Monitoring** : Logs d'audit consultés régulièrement
4. **Formation** : Utilisateurs formés aux bonnes pratiques de sécurité

## Résumé de Protection

✅ **Aucun accès non autorisé possible**
✅ **Validation à plusieurs niveaux**  
✅ **Audit complet des actions**
✅ **Isolation des données par rôle**
✅ **Monitoring en temps réel**
✅ **Conformité aux standards de sécurité**

Le système est conçu pour être **sécurisé par défaut** avec une approche **zero-trust** où chaque accès est validé et audité.
