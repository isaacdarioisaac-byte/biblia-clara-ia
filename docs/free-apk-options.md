# Opciones gratuitas para obtener el APK

La opción más fiable para Biblia Clara IA sin cuotas de compilación externas es **compilar localmente en un ordenador propio**. El proyecto usa módulos nativos de Expo y `llama.rn`, por lo que necesita las herramientas Android habituales para producir un APK instalable.

| Ruta | Cuota de compilación externa | Requisito principal | Adecuación para Biblia Clara IA |
| --- | --- | --- | --- |
| Android Studio + Gradle local | No | Ordenador con Android Studio, JDK y Android SDK | Recomendada |
| Expo local + Gradle | No | Ordenador con JDK, Android SDK y `npx expo prebuild` | Recomendada |
| GitHub Actions en ejecutor propio | No para el cómputo del ordenador propio | Mantener un ordenador o servidor encendido y vinculado a GitHub | Útil para automatizar releases |
| GitHub Actions alojado | Puede tener límites de uso | Cuenta GitHub y un repositorio | No garantiza ausencia de cuotas |
| Servicio de compilación externo | Depende del servicio | Cuenta y cuota disponible | No recomendada para este objetivo |

## Ruta recomendada

En un ordenador Windows, macOS o Linux se puede generar el proyecto nativo con `npx expo prebuild --platform android` y compilarlo desde la carpeta `android` usando Gradle o Android Studio. Para instalar directamente en un teléfono sin publicar en Google Play, se debe generar un APK firmado y copiarlo al teléfono.

> La clave de firma debe conservarse en privado. Sin la misma clave no podrán publicarse actualizaciones sobre una instalación anterior.

## Fuentes

[1]: [Expo — Create a release build locally](https://docs.expo.dev/guides/local-app-production/)
[2]: [Android Developers — Build your app for release](https://developer.android.com/build/build-for-release)
[3]: [GitHub Docs — Self-hosted runners reference](https://docs.github.com/en/actions/reference/runners/self-hosted-runners)
