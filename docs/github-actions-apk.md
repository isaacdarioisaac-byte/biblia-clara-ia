# Compilación FOSS con GitHub Actions

Biblia Clara IA puede compilarse sin Expo EAS mediante un workflow de GitHub Actions que genera el proyecto Android con Expo, ejecuta Gradle y conserva el APK como artefacto del workflow. Cuando se crea una etiqueta de versión, el mismo workflow puede adjuntar el APK a un release descargable.

| Resultado | Mecanismo |
| --- | --- |
| APK para pruebas | Artefacto de GitHub Actions disponible desde el workflow completado |
| APK publicado | Archivo adjunto a un release de GitHub creado desde una etiqueta `v*` |
| Código FOSS | Repositorio público con licencia Apache-2.0 y avisos de terceros |

GitHub documenta que `actions/upload-artifact` puede almacenar el APK construido durante un workflow y que otros trabajos o personas con acceso al workflow pueden descargarlo. GitHub CLI permite crear un release adjuntando archivos como activos descargables [1] [2].

## Referencias

[1]: [GitHub Docs — Store and share data with workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data)
[2]: [GitHub CLI — gh release create](https://cli.github.com/manual/gh_release_create)
