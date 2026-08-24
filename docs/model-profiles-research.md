# Perfiles de IA local: verificación de modelos

Fecha de revisión: 24 de agosto de 2026.

| Perfil propuesto | Repositorio oficial                                    | Cuantización |            Tamaño de archivo observado | Uso previsto                                                         |
| ---------------- | ------------------------------------------------------ | -----------: | -------------------------------------: | -------------------------------------------------------------------- |
| Ligero           | https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF |       Q4_K_M | ~1,12 GB en la configuración existente | Explicaciones simples con menor consumo.                             |
| Equilibrado      | https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF   |       Q4_K_M |                                 2,1 GB | Explicaciones con más matiz cuando el teléfono tenga suficiente RAM. |
| Profundo         | https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF   |       Q3_K_M |                                3,81 GB | Mayor capacidad del grupo; requiere bastante almacenamiento y RAM.   |

Las fichas oficiales de 3B y 7B muestran variantes GGUF y enlaces de uso con llama.cpp. El archivo 7B Q4_K_M está dividido en dos segmentos, por lo que para descarga directa en Android se eligió el 7B Q3_K_M de una sola pieza. Los tamaños de archivo no incluyen la memoria adicional para cargar el modelo ni el contexto durante la inferencia. La pantalla debe describir los requisitos como estimaciones y evitar prometer rendimiento en todos los teléfonos.
