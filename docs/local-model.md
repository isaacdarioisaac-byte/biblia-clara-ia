# Modelo local de Biblia Clara IA

Biblia Clara IA usa **Qwen2.5-1.5B-Instruct en formato GGUF Q4_K_M** como motor opcional de explicaciones. El archivo se descarga a almacenamiento privado de la aplicación Android y la generación se realiza en el teléfono. No se envía el texto del versículo a una clave de API ni a un servicio de IA remoto.

| Propiedad | Decisión |
| --- | --- |
| Motor de inferencia | `llama.rn`, una integración React Native de `llama.cpp` |
| Modelo | `Qwen/Qwen2.5-1.5B-Instruct-GGUF:Q4_K_M` |
| Tamaño publicado | Aproximadamente 1,12 GB |
| Idioma | Modelo multilingüe con soporte de español |
| Licencia del modelo | Apache-2.0 |
| Arquitectura Android | `arm64-v8a` |
| Aceleración predeterminada | CPU, para una compatibilidad amplia |

## Flujo dentro de la aplicación

La primera vez que una persona toque un versículo, la aplicación comprueba si el modelo está instalado. Si no lo está, ofrece descargarlo y muestra el progreso. Al terminar, conserva el archivo dentro del directorio privado de la aplicación. Cada explicación crea una solicitud breve que incluye la referencia y el texto del versículo, y solicita una respuesta sencilla, prudente y respetuosa.

La aplicación no finge una explicación si el modelo no está disponible. En la vista web solo muestra que la función se habilita en el APK Android; el modelo nativo se carga únicamente en Android.

## Requisitos prácticos

Se recomienda una conexión Wi-Fi, al menos 2,5 GB de almacenamiento libre durante la descarga y un teléfono Android de 64 bits. La velocidad de respuesta depende del procesador, la memoria libre y la extensión del pasaje. Las explicaciones son orientativas: no sustituyen la lectura del contexto bíblico ni el acompañamiento pastoral.

## Fuentes

- [Qwen2.5-1.5B-Instruct-GGUF — Hugging Face](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF)
- [llama.rn — documentación de Expo y Android](https://github.com/mybigday/llama.rn)
