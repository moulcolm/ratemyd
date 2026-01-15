# Debug Auth Issues

## Problèmes rapportés
- Le callback de login ne fonctionne pas
- Impossible de faire des actions quand connecté

## Variables d'environnement ajoutées
- ✅ `NEXTAUTH_URL`: https://compared.vercel.app
- ✅ `NEXTAUTH_SECRET`: (généré aléatoirement)
- ✅ `AUTH_SECRET`: (existait déjà)
- ✅ `DATABASE_URL`: (configuré avec Vercel Postgres)

## Tests à faire

### 1. Tester le login
```bash
# Se connecter avec:
Email: admin@ratemyd.com
Password: admin123456
```

### 2. Vérifier les cookies
Après login, vérifier dans DevTools > Application > Cookies :
- `next-auth.session-token` ou `__Secure-next-auth.session-token` doit être présent

### 3. Vérifier la session
Appeler `/api/auth/session` après login pour voir si la session est créée

### 4. Logs Vercel
```bash
vercel logs compared.vercel.app --follow
```

## Solutions potentielles si ça ne fonctionne pas

### Solution 1: Vérifier le middleware
Le middleware dans `src/middleware.ts` doit utiliser NextAuth correctement.

### Solution 2: Vérifier la configuration des cookies
NextAuth v5 avec App Router peut avoir besoin de configuration spéciale pour les cookies en production.

### Solution 3: Debugging NextAuth
Activer le debug dans `auth.config.ts`:
```typescript
export const authConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === 'development',
  // ...
}
```
