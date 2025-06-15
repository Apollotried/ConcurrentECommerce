# E-Commerce Concurrent

Une application e-commerce moderne avec gestion de la concurrence, construite avec Spring Boot et React.

## Description

Cette application e-commerce offre une plateforme complète pour la gestion des produits, des commandes, des utilisateurs et des paiements. Elle implémente une architecture robuste avec gestion de la concurrence pour assurer l'intégrité des données et la cohérence des transactions, particulièrement dans la gestion des stocks et des commandes.

## Prérequis Techniques

### Backend
- Java 21
- Maven 3.8+
- PostgreSQL 15+
- Spring Boot 3.4.5

### Frontend
- Node.js 18+
- npm ou yarn
- React 18+

## Installation et Lancement

### Backend

1. Cloner le repository
```bash
git clone [URL_DU_REPO]
cd distributed-ecommerce
```

2. Configurer la base de données PostgreSQL
- Créer une base de données PostgreSQL
- Configurer les variables d'environnement dans `application.properties`

3. Lancer l'application Spring Boot
```bash
./mvnw spring-boot:run
```

### Frontend

1. Naviguer vers le dossier frontend
```bash
cd frontend
```

2. Installer les dépendances
```bash
npm install
```

3. Lancer l'application en mode développement
```bash
npm start
```

## Architecture du Projet

### Gestion de la Concurrence

L'application implémente plusieurs mécanismes pour gérer la concurrence et assurer la cohérence des données :

1. **Gestion des Stocks**
   - Verrouillage optimiste pour les mises à jour de stock
   - Transactions atomiques pour les opérations critiques
   - Gestion des conflits de mise à jour simultanée

2. **Gestion des Commandes**
   - Verrouillage pessimiste pour la création de commandes
   - Transactions isolées pour le processus de checkout
   - Gestion des timeouts et des rollbacks

3. **Mécanismes de Synchronisation**
   - Locks distribués pour les opérations critiques
   - Gestion des deadlocks
   - Stratégies de retry pour les opérations concurrentes

### Backend (Spring Boot)

L'application backend est structurée en plusieurs modules :

1. **Authentication (`auth`)**
   - Gestion de l'authentification et de l'autorisation
   - JWT pour la sécurité
   - Endpoints : `/api/auth/register`, `/api/auth/authenticate`

2. **Products (`product`)**
   - Gestion du catalogue de produits
   - CRUD complet des produits
   - Endpoints : `/api/products`

3. **Inventory (`inventory`)**
   - Gestion des stocks
   - Mise à jour en masse via CSV
   - Endpoints : `/api/inventory`

4. **Orders (`order`)**
   - Gestion des commandes
   - Processus de checkout
   - Endpoints : `/api/orders`

5. **Cart (`cart`)**
   - Gestion du panier d'achat
   - Endpoints : `/api/cart`

6. **Users (`user`)**
   - Gestion des utilisateurs et clients
   - Endpoints : `/api/customers`

7. **Security (`security`)**
   - Configuration de la sécurité
   - Gestion des rôles et permissions

### Frontend (React)

Le frontend est divisé en deux applications distinctes : le panneau d'administration et le panneau client.

#### 1. Panneau d'Administration (`AdminPanel`)

Le panneau d'administration est une application React moderne qui permet la gestion complète de la plateforme e-commerce.

**Structure des Composants :**
- `AdminLayout.jsx` : Layout principal avec sidebar et header
- `Sidebar.jsx` : Navigation latérale
- `Header.jsx` : En-tête avec notifications et profil
- `ProtectedRoute.jsx` : Protection des routes administrateur

**Pages Principales :**
- Dashboard (`Home.jsx`)
- Gestion des Produits (`ProductPage.jsx`)
- Gestion des Catégories (`CategoryPage.jsx`)
- Gestion des Clients (`CustomerPage.jsx`)
- Gestion des Stocks (`InventoryPage.jsx`)

**Fonctionnalités :**
- Authentification sécurisée
- Gestion CRUD des produits
- Gestion des catégories
- Suivi des stocks
- Gestion des clients
- Tableaux de bord et statistiques
- Notifications toast pour le feedback utilisateur

#### 2. Panneau Client (`CustomerPanel`)

Le panneau client est une application React orientée utilisateur final, offrant une expérience d'achat fluide.

**Structure des Composants :**
- Navigation (`navbar/`)
- Catalogue de produits (`products/`)
- Panier d'achat (`cart/`)
- Processus de commande (`checkout/`)
- Historique des commandes (`orders/`)

**Pages Principales :**
- Catalogue de produits (`Catalog.jsx`)
- Panier (`Cart.jsx`)
- Checkout (`Checkout.jsx`)
- Confirmation de commande (`OrderConfirmation.jsx`)
- Historique des commandes (`OrdersHistory.jsx`)

**Fonctionnalités :**
- Authentification utilisateur
- Navigation intuitive
- Catalogue de produits avec filtres
- Panier d'achat persistant
- Processus de checkout sécurisé
- Suivi des commandes
- Historique des achats

**Technologies Frontend :**
- React 18+
- React Router pour la navigation
- Context API pour la gestion d'état
- Axios pour les appels API
- CSS moderne avec animations
- Composants réutilisables
- Gestion des erreurs et feedback utilisateur

**Sécurité Frontend :**
- Protection des routes
- Gestion des tokens JWT
- Validation des formulaires
- Protection CSRF
- Gestion des sessions

## Mécanismes Concurrents Implémentés

### 1. Gestion des Stocks

- **Verrous pessimistes (PESSIMISTIC_WRITE)** pour les opérations critiques
  - Utilisation de `@Lock(LockModeType.PESSIMISTIC_WRITE)` pour les mises à jour de stock
  - Timeout configurable pour éviter les deadlocks
  - Gestion des exceptions de verrouillage

- **Système de réservation temporaire**
  - Réservation automatique des stocks lors de l'ajout au panier
  - Expiration automatique des réservations non confirmées
  - Nettoyage périodique des réservations expirées

- **Double validation atomique**
  - Vérification préliminaire de disponibilité
  - Validation finale avant confirmation de commande
  - Rollback automatique en cas d'échec

### 2. Transactions Distribuées

- **Workflow de commande transactionnel**
  - Transaction globale pour le processus de commande
  - Sous-transactions pour chaque étape (stock, paiement, livraison)
  - Gestion des timeouts et des retries

- **Mécanisme de compensation**
  - Rollback automatique en cas d'échec
  - Compensation des opérations partielles
  - Journalisation des transactions pour audit

- **Isolation des opérations**
  - Niveau d'isolation configurable par opération
  - Gestion des lectures sales et propres
  - Protection contre les lectures fantômes

### 3. Traitement Parallèle

- **ThreadPool dédié**
  - Pool de threads configurable pour les opérations batch
  - Gestion de la charge et du throttling
  - Monitoring des performances

- **Traitement asynchrone**
  - Import/Export de données en arrière-plan
  - Notifications asynchrones
  - Génération de rapports

- **Priorisation des requêtes**
  - File d'attente prioritaire pour les opérations temps réel
  - Dégradation gracieuse en cas de surcharge
  - Timeout adaptatif

### 4. Cohérence des Données

- **Versioning optimiste**
  - `@Version` pour les entités fréquemment mises à jour
  - Gestion des conflits de version
  - Stratégies de résolution automatique

- **Synchronisation inter-services**
  - Communication événementielle entre services
  - Ordre garanti des opérations
  - Idempotence des opérations

- **Monitoring des conflits**
  - Métriques en temps réel
  - Alertes sur les conflits fréquents
  - Tableau de bord de monitoring

## Fonctionnalités Principales

1. **Gestion des Produits**
   - Création, modification, suppression de produits
   - Catégorisation et recherche
   - Gestion des stocks

2. **Gestion des Commandes**
   - Processus de commande complet
   - Suivi des commandes
   - Historique des commandes

3. **Gestion des Utilisateurs**
   - Inscription et authentification
   - Profils utilisateurs
   - Gestion des rôles

4. **Panier d'Achat**
   - Ajout/Suppression d'articles
   - Mise à jour des quantités
   - Calcul automatique des totaux

5. **Gestion des Stocks**
   - Suivi en temps réel
   - Alertes de stock bas
   - Mise à jour en masse via CSV

## Sécurité

- Authentification JWT
- Validation des données
- Protection CSRF
- Gestion des rôles et permissions
- Chiffrement des mots de passe

## Tests

Le projet inclut des tests unitaires et d'intégration :
```bash
./mvnw test
```

## Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request
