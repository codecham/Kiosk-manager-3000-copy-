# CLAUDE.md — Instructions de développement

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il définit les règles absolues du projet. Toute déviation doit être justifiée explicitement.

---

## 🧠 Philosophie générale

Ce projet suit les principes du **Clean Code** de Robert C. Martin.
Le code doit être **lisible, prévisible, testable et évolutif**.
Un code qui fonctionne mais qui est illisible est un code à réécrire.

> « Any fool can write code that a computer can understand.
> Good programmers write code that humans can understand. » — Martin Fowler

---

## 📦 Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React + TypeScript (strict) |
| UI Components | **shadcn/ui** |
| Styles | Tailwind CSS (via shadcn) |
| Backend | Python (FastAPI recommandé) |
| Linting | ESLint + Prettier |
| Types backend | Pydantic |

---

## 🚀 Setup initial obligatoire

Lors de la **toute première initialisation** du projet frontend, exécuter dans l'ordre :

```bash
# 1. Créer le projet avec Vite + React + TypeScript strict
npm create vite@latest frontend -- --template react-ts
cd frontend

# 2. Installer les dépendances de base
npm install

# 3. Installer Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Initialiser shadcn/ui (suivre les prompts : style=default, base color=slate)
npx shadcn@latest init

# 5. Installer les composants shadcn utilisés dans le projet
# (ajouter au fur et à mesure selon les besoins)
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add toast
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add skeleton

# 6. Installer les utilitaires courants
npm install clsx tailwind-merge lucide-react
npm install react-router-dom
npm install @tanstack/react-query
npm install axios
npm install zod react-hook-form @hookform/resolvers
```

Pour le backend Python :
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn pydantic python-dotenv
```

---

## 🗂️ Architecture des dossiers

### Frontend (`/frontend/src/`)

```
src/
├── app/                        # Configuration globale de l'app
│   ├── App.tsx                 # Composant racine, routing principal
│   ├── providers.tsx           # Tous les Context Providers (QueryClient, Theme, etc.)
│   └── router.tsx              # Définition des routes react-router
│
├── pages/                      # Une page = une route
│   ├── HomePage/
│   │   ├── index.tsx           # Export de la page
│   │   ├── HomePage.tsx        # Composant page
│   │   └── components/         # Composants PRIVÉS à cette page uniquement
│   │       └── HeroSection.tsx
│   └── DashboardPage/
│       ├── index.tsx
│       ├── DashboardPage.tsx
│       └── components/
│           └── StatsGrid.tsx
│
├── components/                 # Composants RÉUTILISABLES dans toute l'app
│   ├── ui/                     # ← Généré automatiquement par shadcn (NE PAS MODIFIER)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/                 # Composants de mise en page
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageWrapper.tsx
│   └── common/                 # Composants métier réutilisables
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── ConfirmDialog.tsx
│
├── hooks/                      # Custom hooks React
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── services/                   # Appels API (1 fichier = 1 domaine)
│   ├── api.ts                  # Instance axios configurée
│   ├── auth.service.ts
│   └── users.service.ts
│
├── stores/                     # État global (Zustand ou Context)
│   ├── auth.store.ts
│   └── ui.store.ts
│
├── types/                      # Types et interfaces TypeScript
│   ├── api.types.ts            # Types des réponses API
│   ├── models.types.ts         # Types des entités métier
│   └── common.types.ts         # Types utilitaires partagés
│
├── lib/                        # Utilitaires purs (sans effets de bord)
│   ├── utils.ts                # cn(), formatDate(), etc.
│   ├── validators.ts           # Schémas Zod
│   └── constants.ts            # Constantes globales
│
├── styles/
│   └── globals.css             # Variables CSS + imports Tailwind
│
└── main.tsx                    # Point d'entrée
```

### Backend (`/backend/`)

```
backend/
├── app/
│   ├── main.py                 # FastAPI app + include routers
│   ├── config.py               # Settings (Pydantic BaseSettings)
│   │
│   ├── api/                    # Couche HTTP uniquement (routes)
│   │   ├── deps.py             # Dépendances FastAPI (auth, db session)
│   │   └── v1/
│   │       ├── router.py       # Router principal v1
│   │       ├── auth.py         # Routes /auth/*
│   │       └── users.py        # Routes /users/*
│   │
│   ├── core/                   # Logique métier pure
│   │   ├── auth.py
│   │   └── users.py
│   │
│   ├── models/                 # Modèles de BDD (SQLAlchemy, etc.)
│   │   └── user.py
│   │
│   └── schemas/                # Schémas Pydantic (entrée/sortie API)
│       ├── user.py
│       └── common.py
│
├── tests/
│   └── test_users.py
├── .env
├── .env.example
└── requirements.txt
```

---

## ✅ Règles du Clean Code — Frontend (React / TypeScript)

### 1. Une fonction = une responsabilité

Chaque fonction ne fait **qu'une seule chose**.
Si tu dois mettre un "et" pour décrire ce que fait une fonction, elle doit être découpée.

```tsx
// ❌ INTERDIT
const handleSubmit = async (data: FormData) => {
  setLoading(true);
  const formatted = { ...data, name: data.name.trim().toLowerCase() };
  const response = await fetch('/api/users', { method: 'POST', body: JSON.stringify(formatted) });
  const json = await response.json();
  setUser(json);
  setLoading(false);
  toast({ title: 'Compte créé !' });
  navigate('/dashboard');
};

// ✅ CORRECT
const formatUserPayload = (data: FormData): CreateUserPayload => ({
  ...data,
  name: data.name.trim().toLowerCase(),
});

const handleSubmit = async (data: FormData) => {
  setLoading(true);
  try {
    const user = await createUser(formatUserPayload(data));
    setUser(user);
    toast({ title: 'Compte créé !' });
    navigate('/dashboard');
  } finally {
    setLoading(false);
  }
};
```

---

### 2. Limites strictes de taille

| Élément | Limite |
|---|---|
| Fonction / hook | ~20–30 lignes max |
| Composant React (JSX inclus) | ~80–100 lignes max |
| Fichier | ~200–300 lignes max |

Au-delà de ces limites → **extraire** dans un sous-composant ou un hook dédié.

---

### 3. Pas de `if/else` imbriqués — Early returns

```tsx
// ❌ INTERDIT
const getStatus = (user: User) => {
  if (user) {
    if (user.isActive) {
      if (user.hasProfile) {
        return 'complete';
      } else {
        return 'incomplete';
      }
    } else {
      return 'inactive';
    }
  } else {
    return 'unknown';
  }
};

// ✅ CORRECT
const getStatus = (user: User | null): UserStatus => {
  if (!user) return 'unknown';
  if (!user.isActive) return 'inactive';
  if (!user.hasProfile) return 'incomplete';
  return 'complete';
};
```

---

### 4. Nommage explicite — Zéro commentaire "quoi"

Les noms doivent être assez clairs pour que le code se lise comme du texte.
Les commentaires n'expliquent **jamais ce que fait** le code, seulement **pourquoi** une décision a été prise.

```tsx
// ❌ INTERDIT
const x = users.filter(u => u.a); // filtre les actifs
const d = new Date(); // date actuelle

// ✅ CORRECT
const activeUsers = users.filter(isUserActive);
const currentDate = new Date();

// ❌ INTERDIT
// On vérifie si l'utilisateur est connecté
if (session && session.user && session.expires > Date.now()) { ... }

// ✅ CORRECT
// JWT expiré côté serveur mais pas encore rafraîchi côté client
if (isSessionValid(session)) { ... }
```

Règles de nommage :
- **Booléens** : préfixer par `is`, `has`, `can`, `should` → `isLoading`, `hasError`, `canEdit`
- **Fonctions** : verbe d'action → `fetchUsers`, `formatDate`, `validateEmail`
- **Composants** : PascalCase, nom descriptif → `UserProfileCard`, `EmptyStateMessage`
- **Hooks** : préfixer par `use` → `useCurrentUser`, `usePagination`
- **Types/Interfaces** : PascalCase, pas de préfixe `I` → `User`, `ApiResponse<T>`
- **Constantes** : SCREAMING_SNAKE_CASE → `MAX_RETRY_COUNT`, `API_BASE_URL`

---

### 5. TypeScript strict — Zéro `any`

Le fichier `tsconfig.json` doit toujours avoir :
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

```tsx
// ❌ INTERDIT
const processData = (data: any) => { ... };
const user = response.data as any;

// ✅ CORRECT
const processData = (data: ApiResponse<User[]>) => { ... };
const user = response.data as User; // uniquement si le type est garanti
```

Typer **tous** les props de composants avec une interface dédiée :

```tsx
// ❌ INTERDIT
const UserCard = ({ user, onClick, loading }: any) => { ... };

// ✅ CORRECT
interface UserCardProps {
  user: User;
  onClick: (userId: string) => void;
  isLoading?: boolean;
}

const UserCard = ({ user, onClick, isLoading = false }: UserCardProps) => { ... };
```

---

### 6. Composants réutilisables avec shadcn/ui

**Toujours** utiliser les composants shadcn/ui comme base. Ne jamais créer un bouton, input, dialog, card, etc. from scratch.

```tsx
// ❌ INTERDIT
<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  Enregistrer
</button>

// ✅ CORRECT
import { Button } from '@/components/ui/button';
<Button variant="default">Enregistrer</Button>
```

Étendre shadcn avec des **wrapper components** si besoin de variantes métier :

```tsx
// src/components/common/SubmitButton.tsx
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
  label: string;
  loadingLabel?: string;
}

const SubmitButton = ({ isLoading, label, loadingLabel = 'Chargement...' }: SubmitButtonProps) => (
  <Button type="submit" disabled={isLoading}>
    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {isLoading ? loadingLabel : label}
  </Button>
);

export default SubmitButton;
```

---

### 7. Gestion des états asynchrones

Utiliser **TanStack Query** pour tous les appels API :

```tsx
// ❌ INTERDIT — useState + useEffect pour les données serveur
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);
useEffect(() => {
  setLoading(true);
  fetch('/api/users').then(r => r.json()).then(setUsers).finally(() => setLoading(false));
}, []);

// ✅ CORRECT
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/services/users.service';

const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

---

### 8. Organisation des imports

Ordre strict des imports (ESLint peut l'enforcer automatiquement) :

```tsx
// 1. React en premier
import { useState, useCallback } from 'react';

// 2. Librairies externes
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Composants internes (alias @/)
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import UserCard from '@/components/common/UserCard';

// 4. Hooks, services, stores
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { fetchUsers } from '@/services/users.service';

// 5. Types
import type { User } from '@/types/models.types';

// 6. Styles (si nécessaire)
import './styles.css';
```

---

## ✅ Règles du Clean Code — Backend (Python / FastAPI)

### 1. Une route = une action HTTP, zéro logique métier

```python
# ❌ INTERDIT — logique métier dans la route
@router.post("/users")
async def create_user(data: CreateUserSchema, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    hashed = bcrypt.hash(data.password)
    user = User(email=data.email, password=hashed, name=data.name)
    db.add(user)
    db.commit()
    return user

# ✅ CORRECT — la route délègue à la couche core
@router.post("/users", response_model=UserSchema, status_code=201)
async def create_user(data: CreateUserSchema, db: Session = Depends(get_db)):
    return await user_service.create(db, data)
```

### 2. Typage fort avec Pydantic

```python
# ❌ INTERDIT
def create_user(data: dict):
    email = data.get('email')
    ...

# ✅ CORRECT
from pydantic import BaseModel, EmailStr, Field

class CreateUserSchema(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8)

class UserSchema(BaseModel):
    id: int
    email: EmailStr
    name: str
    is_active: bool

    class Config:
        from_attributes = True
```

### 3. Variables d'environnement via `.env`

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()
```

Ne **jamais** écrire une URL de BDD, une clé API ou un secret en dur dans le code.

### 4. Nommage Python

- **Fonctions et variables** : `snake_case`
- **Classes** : `PascalCase`
- **Constantes** : `SCREAMING_SNAKE_CASE`
- **Fichiers** : `snake_case.py`
- **Fonctions async** : toujours préfixer par `async def` si I/O

---

## 🔒 Règles absolues (JAMAIS faire)

### Frontend
- ❌ `any` en TypeScript
- ❌ Modifier les fichiers dans `src/components/ui/` (généré par shadcn)
- ❌ Logique métier dans les composants de page → extraire dans un hook
- ❌ Appels `fetch` ou `axios` directement dans les composants → passer par `services/`
- ❌ Hardcoder des URLs → utiliser les constantes de `lib/constants.ts`
- ❌ CSS inline avec `style={{}}` sauf cas de valeurs dynamiques impossibles en Tailwind
- ❌ Commiter des fichiers `.env` avec de vraies valeurs

### Backend
- ❌ Logique métier dans les routes
- ❌ Mots de passe ou secrets dans le code source
- ❌ `dict` non typé comme paramètre ou retour de fonction
- ❌ `except Exception: pass` — toujours logguer ou relancer

---

## 📋 Checklist avant chaque modification

Avant de soumettre du code, vérifier :

- [ ] Chaque fonction fait une seule chose
- [ ] Aucune fonction ne dépasse 30 lignes
- [ ] Aucun composant ne dépasse 100 lignes
- [ ] Tous les types sont explicites (pas de `any`)
- [ ] Les noms sont auto-descriptifs
- [ ] Les composants UI viennent de shadcn/ui
- [ ] Les appels API passent par les services
- [ ] Pas de secret ou de valeur hardcodée

---

## 🔧 Configuration des outils

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### `.eslintrc.json`
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/react-in-jsx-scope": "off",
    "no-console": "warn"
  }
}
```

### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

---

## 💡 Patterns à suivre

### Composant standard
```tsx
// src/components/common/UserCard.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/types/models.types';

interface UserCardProps {
  user: User;
  onSelect?: (id: string) => void;
}

const UserCard = ({ user, onSelect }: UserCardProps) => {
  const handleClick = () => onSelect?.(user.id);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardHeader>
        <h3 className="font-semibold">{user.name}</h3>
        <Badge variant={user.isActive ? 'default' : 'secondary'}>
          {user.isActive ? 'Actif' : 'Inactif'}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </CardContent>
    </Card>
  );
};

export default UserCard;
```

### Service API
```ts
// src/services/users.service.ts
import api from './api';
import type { User, CreateUserPayload } from '@/types/models.types';

export const fetchUsers = (): Promise<User[]> =>
  api.get('/users').then(res => res.data);

export const createUser = (payload: CreateUserPayload): Promise<User> =>
  api.post('/users', payload).then(res => res.data);

export const deleteUser = (id: string): Promise<void> =>
  api.delete(`/users/${id}`);
```

### Custom hook
```ts
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser } from '@/services/users.service';
import type { CreateUserPayload } from '@/types/models.types';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createUser: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};
```
