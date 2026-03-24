---
description: Norma Básica Obligatoria al Finalizar (Sincronización GitHub)
---
# Sincronización Obligatoria con GitHub

Siempre que se haya resuelto un problema, actualizado el código o modificado configuraciones (locales o en el VPS), es **estrictamente obligatorio** sincronizar los cambios con GitHub antes de dar por terminada la sesión.

## Pasos

1. Verifica el estado local:
```bash
git status
```

2. Añade los cambios relevantes:
```bash
git add .
```

3. Crea el commit documentando los problemas solucionados:
```bash
git commit -m "fix/feat: resumen objetivo de lo realizado"
```

4. Sincroniza con el repositorio remoto (GitHub):
```bash
git push
```
