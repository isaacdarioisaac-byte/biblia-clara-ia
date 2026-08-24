# Modelos locales de Biblia Clara IA

Biblia Clara IA ofrece tres perfiles opcionales de **Qwen2.5 Instruct en formato GGUF Q4_K_M**. Cada archivo se descarga a almacenamiento privado de la aplicación Android y la generación se realiza en el teléfono. No se envía el texto del versículo a una clave de API ni a un servicio de IA remoto.

| Perfil      | Modelo                                   | Archivo                             | Descarga aproximada | Elección práctica                                                                   |
| ----------- | ---------------------------------------- | ----------------------------------- | ------------------: | ----------------------------------------------------------------------------------- |
| Ligero      | `Qwen/Qwen2.5-1.5B-Instruct-GGUF:Q4_K_M` | `qwen2.5-1.5b-instruct-q4_k_m.gguf` |             1,12 GB | Predeterminado; pensado para explicaciones breves y una compatibilidad amplia.      |
| Equilibrado | `Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M`   | `qwen2.5-3b-instruct-q4_k_m.gguf`   |             2,10 GB | Más matiz en la explicación; recomendado solo en teléfonos con buena memoria libre. |
| Profundo    | `Qwen/Qwen2.5-7B-Instruct-GGUF:Q3_K_M`   | `qwen2.5-7b-instruct-q3_k_m.gguf`   |             3,81 GB | La mayor capacidad del grupo; puede ser lento o no caber en teléfonos modestos.     |

| Propiedad                  | Decisión                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Motor de inferencia        | `llama.rn`, una integración React Native de `llama.cpp`                             |
| Idioma                     | Qwen2.5 es multilingüe e incluye soporte de español                                 |
| Arquitectura Android       | `arm64-v8a`                                                                         |
| Aceleración predeterminada | CPU, para una compatibilidad amplia                                                 |
| Selección                  | Solo un perfil se usa a la vez; instalar otro no elimina los modelos ya descargados |

## Flujo dentro de la aplicación

La primera vez que una persona toque un versículo, la aplicación comprueba si el perfil seleccionado está instalado. Si no lo está, ofrece descargarlo y muestra el progreso. Al terminar, conserva el archivo dentro del directorio privado de la aplicación. La persona puede cambiar entre Ligero, Equilibrado y Profundo desde el selector de IA. Cada explicación crea una solicitud breve que incluye la referencia y el texto del versículo, y solicita una respuesta sencilla, prudente y respetuosa.

La aplicación no finge una explicación si el modelo no está disponible. En la vista web solo muestra que la función se habilita en el APK Android; el modelo nativo se carga únicamente en Android.

## Requisitos prácticos

Se recomienda Wi-Fi y un teléfono Android de 64 bits. Como margen práctico de almacenamiento libre, la aplicación solicita aproximadamente 2,5 GB para Ligero, 3,5 GB para Equilibrado y 5 GB para Profundo. Los tamaños publicados se refieren al archivo descargado; se necesita memoria adicional durante la carga y la generación. La variante oficial 7B Q4_K_M se publica dividida en dos archivos, por lo que la aplicación usa el perfil 7B Q3_K_M de una sola pieza para que pueda descargarse y cargarse directamente. La velocidad de respuesta depende del procesador, la memoria libre y la extensión del pasaje, por lo que Profundo debe probarse primero en un teléfono de gama media-alta o superior. Las explicaciones son orientativas: no sustituyen la lectura del contexto bíblico ni el acompañamiento pastoral.

## Fuentes

- [Qwen2.5-1.5B-Instruct-GGUF — Hugging Face](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF)
- [Qwen2.5-3B-Instruct-GGUF — Hugging Face](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF)
- [Qwen2.5-7B-Instruct-GGUF — Hugging Face](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF)
- [llama.rn — documentación de Expo y Android](https://github.com/mybigday/llama.rn)
