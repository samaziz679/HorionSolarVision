# Solar Vision ERP - Manuel d'Utilisation

## Table des Matières
1. [Introduction](#introduction)
2. [Connexion et Navigation](#connexion-et-navigation)
3. [Gestion des Produits](#gestion-des-produits)
4. [Gestion des Achats](#gestion-des-achats)
5. [Gestion des Ventes](#gestion-des-ventes)
6. [Gestion de l'Inventaire](#gestion-de-linventaire)
7. [Gestion des Fournisseurs](#gestion-des-fournisseurs)
8. [Gestion des Clients](#gestion-des-clients)
9. [Rapports et Analyses](#rapports-et-analyses)
10. [Administration](#administration)
11. [Dépannage](#dépannage)

---

## Introduction

Solar Vision ERP est un système de gestion d'entreprise complet conçu spécialement pour les entreprises du secteur solaire au Burkina Faso. Le système offre une traçabilité complète des stocks avec gestion par lots, permettant un suivi précis de vos équipements solaires.

### Fonctionnalités Principales
- **Gestion par lots (FIFO)** : Traçabilité complète de chaque produit
- **Import en masse** : Chargement rapide des achats via fichiers CSV
- **Rapports avancés** : Analyses financières et de performance
- **Multi-utilisateurs** : Gestion des rôles et permissions
- **Interface bilingue** : Français avec support technique

---

## Connexion et Navigation

### Première Connexion
1. Accédez à l'URL de votre installation
2. Utilisez vos identifiants fournis par l'administrateur
3. Changez votre mot de passe lors de la première connexion

### Navigation Principale
- **Tableau de bord** : Vue d'ensemble des activités
- **Inventaire** : Gestion des stocks et produits
- **Achats** : Commandes et réceptions
- **Ventes** : Transactions clients
- **Fournisseurs** : Carnet d'adresses fournisseurs
- **Clients** : Base de données clients
- **Rapports** : Analyses et statistiques
- **Administration** : Gestion des utilisateurs (admin uniquement)

---

## Gestion des Produits

### Ajouter un Nouveau Produit
1. Allez dans **Inventaire** → **Ajouter Produit**
2. Remplissez les informations :
   - **Nom** : Nom du produit (ex: "Batterie 200Ah")
   - **Type** : Catégorie (Batterie, Panneau, Onduleur, etc.)
   - **Description** : Détails techniques
   - **Prix d'achat** : Coût d'acquisition
   - **Prix de vente** : Tarifs de vente (détail 1, détail 2, gros)
   - **Seuil critique** : Niveau d'alerte stock bas
   - **Image** : Photo du produit (optionnel)

3. Cliquez **Enregistrer**

### Modifier un Produit
1. Dans la liste des produits, cliquez sur l'icône **Modifier**
2. Modifiez les informations nécessaires
3. Sauvegardez les changements

---

## Gestion des Achats

### Créer un Achat Simple
1. Allez dans **Achats** → **Nouvel Achat**
2. Sélectionnez :
   - **Produit** : Choisir dans la liste
   - **Fournisseur** : Sélectionner le fournisseur
   - **Quantité** : Nombre d'unités
   - **Prix unitaire** : Coût par unité
   - **Date d'achat** : Date de la transaction

3. Le système créera automatiquement un **lot** avec numéro unique (ex: LOT-2025-001)

### Import en Masse (CSV)
1. Allez dans **Achats** → **Import CSV**
2. Téléchargez le modèle CSV
3. Remplissez le fichier avec vos données :
   \`\`\`csv
   product_name,supplier_name,quantity,unit_price,purchase_date,prix_vente_detail_1,prix_vente_detail_2,prix_vente_gros
   Batterie 200Ah,Solar Tech Import,50,75000,2025-01-15,95000,90000,80000
   Panneau 300W,West Africa Solar,100,45000,2025-01-15,60000,55000,50000
   \`\`\`
4. Importez le fichier
5. Vérifiez et confirmez l'import

**Champs CSV :**
- `product_name` : Nom exact du produit (obligatoire)
- `supplier_name` : Nom exact du fournisseur (obligatoire)
- `quantity` : Quantité achetée (obligatoire)
- `unit_price` : Prix unitaire d'achat (obligatoire)
- `purchase_date` : Date au format YYYY-MM-DD (optionnel)
- `prix_vente_detail_1/2` : Prix de vente détail (optionnel)
- `prix_vente_gros` : Prix de vente en gros (optionnel)

---

## Gestion des Ventes

### Créer une Vente
1. Allez dans **Ventes** → **Nouvelle Vente**
2. Sélectionnez :
   - **Client** : Choisir ou créer un nouveau client
   - **Produit** : Sélectionner le produit à vendre
   - **Quantité** : Nombre d'unités
   - **Prix unitaire** : Prix de vente

3. Le système déduira automatiquement du stock le plus ancien (FIFO)

### Suivi des Ventes
- Consultez l'historique dans **Ventes**
- Filtrez par date, client, ou produit
- Exportez les rapports de vente

---

## Gestion de l'Inventaire

### Vue d'Ensemble
L'inventaire affiche pour chaque produit :
- **Quantité totale** disponible
- **Nombre de lots** en stock
- **Coût moyen** pondéré
- **Statut** : Normal, Faible, Critique
- **Détails des lots** : Quantités par lot avec dates

### Gestion par Lots
Chaque achat crée un lot unique permettant :
- **Traçabilité complète** : Savoir d'où vient chaque produit
- **Gestion FIFO** : Les ventes déduisent du stock le plus ancien
- **Suivi des coûts** : Coût réel par lot d'achat
- **Dates d'expiration** : Suivi de l'âge du stock

### Alertes Stock
- **Critique** (rouge) : Stock à zéro
- **Faible** (orange) : En dessous du seuil défini
- **Normal** (vert) : Stock suffisant

---

## Gestion des Fournisseurs

### Ajouter un Fournisseur
1. Allez dans **Fournisseurs** → **Nouveau Fournisseur**
2. Remplissez :
   - **Nom** : Raison sociale
   - **Contact** : Personne de contact
   - **Téléphone** : Numéro principal
   - **Email** : Adresse électronique
   - **Adresse** : Adresse complète

### Suivi Fournisseurs
- Historique des achats par fournisseur
- Performance et délais de livraison
- Coordonnées et contacts

---

## Gestion des Clients

### Créer un Client
1. Allez dans **Clients** → **Nouveau Client**
2. Saisissez les informations client
3. Définissez les conditions de paiement si nécessaire

### Suivi Client
- Historique des ventes
- Chiffre d'affaires par client
- Coordonnées et préférences

---

## Rapports et Analyses

### Tableau de Bord Analytique
Le tableau de bord affiche :
- **Chiffre d'affaires** : Revenus totaux
- **Bénéfice net** : Profit après charges
- **Dépenses totales** : Coûts d'exploitation
- **Clients actifs** : Nombre de clients ayant acheté

### Analyses Financières
- **Marge bénéficiaire** : Rentabilité globale
- **Ratio dépenses/CA** : Contrôle des coûts
- **Croissance** : Évolution du chiffre d'affaires

### Analyses d'Inventaire
- **Alertes stock** : Produits nécessitant attention
- **Top produits** : Meilleures ventes
- **Rotation des stocks** : Vitesse d'écoulement
- **Vieillissement** : Âge des lots en stock

### Périodes d'Analyse
- Derniers 30 jours
- 3 derniers mois
- 6 derniers mois
- Année en cours
- Période personnalisée

---

## Administration

### Gestion des Utilisateurs

Le système Solar Vision ERP utilise un système d'authentification à deux niveaux :

1. **Authentification Supabase** : Gestion sécurisée des connexions et sessions
2. **Système de Rôles Personnalisé** : Contrôle des permissions et accès aux modules

#### Processus d'Inscription des Nouveaux Utilisateurs

**Étape 1 : Invitation par Magic Link**
1. L'administrateur va dans **Administration** → **Utilisateurs**
2. Clique sur **Nouvel Utilisateur**
3. Saisit l'email et les informations du nouvel utilisateur
4. Le système envoie automatiquement un lien magique par email

**Étape 2 : Activation par l'Utilisateur**
1. L'utilisateur reçoit un email avec un lien de confirmation
2. Il clique sur le lien pour activer son compte
3. Le système crée automatiquement un profil avec le rôle "vendeur" et statut "pending"

**Étape 3 : Attribution des Rôles par l'Admin**
1. L'administrateur voit le nouvel utilisateur dans la liste
2. Il peut modifier le rôle et changer le statut de "pending" à "active"
3. L'utilisateur peut maintenant accéder au système selon ses permissions

#### Rôles et Permissions

**Admin** : Accès complet au système
- Gestion des utilisateurs et rôles
- Configuration du système
- Accès à tous les modules
- Consultation du journal d'audit

**Manager** : Gestion opérationnelle
- Gestion des achats et ventes
- Rapports et analyses
- Gestion des stocks
- Pas d'accès à l'administration des utilisateurs

**Vendeur** : Opérations de vente
- Création et consultation des ventes
- Consultation du stock disponible
- Gestion des clients
- Accès limité aux rapports

#### Interface de Gestion des Utilisateurs

L'interface comprend deux onglets principaux :

**Onglet "Utilisateurs"**
- Liste complète des utilisateurs du système
- Informations affichées : Email, Nom, Rôle, Statut, Date de création
- Actions disponibles : Modifier le rôle et statut
- Bouton "Nouvel Utilisateur" pour inviter de nouveaux membres

**Onglet "Journal d'Audit"**
- Historique complet des actions importantes
- Traçabilité : Qui a fait quoi et quand
- Détails des modifications (anciennes et nouvelles valeurs)
- Informations techniques : Adresse IP, navigateur utilisé

#### Résolution des Problèmes d'Authentification

**Problème : Erreur 404 après clic sur le lien magique**
- **Cause** : Route de callback manquante ou mal configurée
- **Solution** : Vérifier que l'intégration Supabase est correctement configurée dans Vercel

**Problème : Utilisateur ne peut pas se connecter après inscription**
- **Cause** : Statut "pending" ou rôle non attribué
- **Solution** : L'admin doit changer le statut à "active" dans la gestion des utilisateurs

**Problème : Accès refusé à certains modules**
- **Cause** : Permissions insuffisantes pour le rôle attribué
- **Solution** : Vérifier et ajuster le rôle de l'utilisateur

#### Configuration Supabase

**Variables d'Environnement Requises :**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anonyme
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service
\`\`\`

**Configuration de l'Authentification :**
1. Dans Supabase Dashboard → Authentication → Settings
2. Activer "Enable email confirmations"
3. Configurer l'URL de redirection : `https://votre-domaine.vercel.app/auth/callback`

### Configuration des Intégrations Vercel

#### Sélection de l'Intégration Supabase par Défaut

Si vous avez plusieurs projets Supabase connectés à Vercel :

1. **Accédez aux Paramètres du Projet Vercel**
2. **Allez dans l'onglet "Integrations"**
3. **Trouvez la section Supabase**
4. **Sélectionnez le projet correct** (ex: "HorionSolarVision")
5. **Cliquez sur "Set as Default"** ou configurez les variables d'environnement

**Important :** Assurez-vous que les variables d'environnement pointent vers le bon projet Supabase :
- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` correspond au projet souhaité
- Confirmez que les clés API sont du bon projet

#### Vérification de la Configuration

Pour vérifier que la bonne base de données est utilisée :

1. **Connectez-vous à votre application**
2. **Allez dans Administration → Utilisateurs**
3. **Vérifiez que vous voyez les bons utilisateurs**
4. **Si les données ne correspondent pas**, vérifiez les variables d'environnement

---

## Dépannage

### Problèmes Courants

**Impossible de se connecter**
- Vérifiez vos identifiants
- Contactez l'administrateur pour réinitialiser le mot de passe

**Produit non trouvé lors de l'import CSV**
- Vérifiez l'orthographe exacte du nom du produit
- Créez d'abord le produit dans l'inventaire

**Stock négatif après vente**
- Le système empêche les ventes supérieures au stock
- Vérifiez les quantités disponibles

**Lots non créés automatiquement**
- Vérifiez que l'achat a été validé correctement
- Contactez le support technique

### Support Technique
- **Email** : support@solarvision.bf
- **Téléphone** : +226 XX XX XX XX
- **Heures** : Lundi-Vendredi 8h-17h

---

## Bonnes Pratiques

### Gestion Quotidienne
1. **Vérifiez les alertes stock** chaque matin
2. **Saisissez les ventes** en temps réel
3. **Validez les achats** dès réception
4. **Consultez le tableau de bord** régulièrement

### Gestion Mensuelle
1. **Analysez les rapports** de performance
2. **Vérifiez l'inventaire physique** vs système
3. **Exportez les données** pour la comptabilité
4. **Nettoyez les données** obsolètes

### Sécurité
1. **Changez les mots de passe** régulièrement
2. **Déconnectez-vous** après utilisation
3. **Sauvegardez les données** importantes
4. **Limitez les accès** selon les besoins

---

## Glossaire

**Lot** : Groupe de produits identiques achetés ensemble, avec numéro unique de traçabilité

**FIFO** : First In, First Out - Méthode de sortie du stock le plus ancien en premier

**Seuil critique** : Niveau de stock minimum déclenchant une alerte

**Coût moyen pondéré** : Prix moyen calculé selon les quantités et coûts des différents lots

**RLS** : Row Level Security - Sécurité au niveau des lignes de données

---

*Manuel d'utilisation Solar Vision ERP v1.0*  
*Dernière mise à jour : Janvier 2025*
