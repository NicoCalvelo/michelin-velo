# Michelin Vélo - Hackathon

Projet réalisé dans le cadre du hackathon 5eESGI architecture et ingénierie logicielle.

L'objectif est de proposer une solution digitale pour aider Michelin à renforcer sa présence sur le marché du pneu vélo premium, créer de la demande auprès des cyclistes et faciliter la conversion vers l'achat en ligne.

## Problématique

Michelin est reconnu pour son expertise, son innovation et sa performance. Pourtant, sur le marché du vélo, la marque n'est pas toujours un réflexe d'achat naturel pour les cyclistes.

Le projet répond donc à un double enjeu :

- créer de l'envie autour des pneus Michelin vélo ;
- transformer cette envie en achat rapidement grâce à un parcours digital orienté e-retail.

## Concept

La solution transforme l'expertise Michelin en expérience personnalisée.

Le parcours utilisateur repose sur trois piliers :

1. Comprendre le cycliste avec un quiz simple.
2. Recommander le pneu Michelin adapté à sa pratique.
3. Fidéliser avec des challenges connectés à Strava et des avantages.

L'utilisateur ne navigue pas seulement dans un catalogue technique : il est guidé selon son usage réel.

## Fonctionnalités principales

### Catalogue produits

- Liste des pneus Michelin disponibles.
- Fiches produits détaillées.
- Affichage des variantes, dimensions, prix, stock et caractéristiques.
- Données prévues pour être chargées depuis Firebase.

### Quiz de recommandation

- Questions sur la pratique, le terrain, le niveau et les attentes.
- Filtrage des produits selon les données réellement présentes en base.
- Recommandation personnalisée pour réduire l'hésitation avant achat.

### Challenges

- Page dédiée aux défis cyclistes.
- Challenges par type de pratique : route, gravel, ville, régularité.
- Connexion prévue avec Strava pour suivre la progression.
- Récompenses et avantages pour inciter au retour vers l'achat.

### Administration

- Gestion des produits.
- Gestion des expériences liées aux produits.
- Authentification et accès administrateur.

## Routes utiles

```text
/                         Page d'accueil
/product                  Catalogue produits
/product/[id]             Fiche produit
/quiz                     Quiz de recommandation
/challenges               Challenges et suivi Strava
/admin                    Back-office administrateur
/admin/products           Gestion des produits
/admin/experiences        Gestion des expériences produit
/auth                     Authentification utilisateur
```

## Stack technique

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Firebase
- Firebase Auth
- Firestore
- Firebase Storage

## Architecture

```text
app/
  _components/            Composants réutilisables
  _models/                Types métier
  _repositories/          Accès aux données Firebase
  _services/              Services techniques
  admin/                  Back-office
  product/                Pages catalogue et produit
  quiz/                   Quiz de recommandation
  challenges/             Page challenges
```

## Installation

Installer les dépendances :

```bash
npm install
```

Lancer le serveur de développement :

```bash
npm run dev
```

Ouvrir ensuite :

```text
http://localhost:3000
```

## Variables d'environnement

Créer un fichier `.env.local` à la racine du projet avec les variables Firebase :

```env
NEXT_PUBLIC_IS_PROD=false
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Commandes utiles

```bash
npm run dev      # Lance le serveur local
npm run build    # Génère le build de production
npm run start    # Lance l'application buildée
npm run lint     # Vérifie le code avec ESLint
```
