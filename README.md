# Biblia Clara IA

Biblia Clara IA es una aplicación Android de código abierto para leer pasajes bíblicos y pedir una explicación sencilla de cada versículo. La explicación se genera localmente, después de descargar opcionalmente un modelo GGUF; no requiere una clave de API.

## APK FOSS desde GitHub Actions

El workflow `.github/workflows/build-foss-apk.yml` crea un APK de depuración instalable al ejecutarse manualmente, al enviar cambios a `main` o al crear una etiqueta que empiece por `v`. El APK queda como artefacto del workflow. Cuando el disparador es una etiqueta, también se adjunta a un GitHub Release para su descarga directa.

El APK de depuración está firmado con la clave de depuración generada durante la compilación. Es adecuado para instalar y probar la aplicación, pero no es una distribución firmada para una tienda de aplicaciones ni garantiza actualizaciones entre compilaciones. Para una versión de producción mantenible, el repositorio debe configurar una clave de firma propia como secretos de GitHub.

## Compilar localmente

```sh
pnpm install --frozen-lockfile
npx expo prebuild --platform android --non-interactive --no-install
cd android
./gradlew app:assembleDebug
```

El archivo se genera en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Licencia y modelos

El código de esta aplicación se distribuye bajo la licencia MIT. Consulta `LICENSE` y `NOTICE`. El modelo Qwen2.5 utilizado para las explicaciones se descarga por separado, tiene licencia Apache-2.0 y no se incluye dentro del APK.
