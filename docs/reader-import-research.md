# Importación privada de ePub y PDF

Fecha de revisión: 25 de agosto de 2026.

| Necesidad | Alternativa confirmada | Decisión para el lector |
| --- | --- | --- |
| Seleccionar archivos en Android | `expo-document-picker` abre el selector del sistema y devuelve una URI local. Con `copyToCacheDirectory` permite que APIs posteriores accedan al archivo de inmediato. | Aceptar únicamente ePub y PDF elegidos explícitamente por la persona usuaria. |
| PDF digital con texto | `expo-pdf-text-extract` extrae texto con APIs nativas de Android y admite URI `content://` del selector. Puede extraer texto por página. | Mostrar páginas de texto y permitir elegir un fragmento para explicarlo. |
| PDF escaneado | Un PDF formado por imágenes no contiene texto seleccionable; la extracción sin OCR puede devolver texto vacío. | Informar la limitación y no inventar contenido. La función OCR se considera una mejora separada. |
| PDF protegido | La biblioteca detecta que falta o es incorrecta la contraseña. | Informar que el documento necesita una contraseña, sin guardar ni transmitirla. |
| ePub | ePub es un contenedor ZIP de HTML/XHTML; puede procesarse localmente y agruparse por secciones o capítulos. | Importar el archivo local y presentar capítulos o secciones cuando el contenido lo exponga. |
| OCR local | `expo-text-extractor` usa Google ML Kit en Android y Apple Vision en iOS; recibe la URI de una imagen y devuelve el texto reconocido. | Usar OCR únicamente sobre una imagen de página proporcionada por el lector. No enviar las páginas a un servidor. |
| Mostrar PDF | Un renderizador PDF nativo puede mostrar un PDF local, pero el OCR necesita una imagen de la página. | La primera entrega mostrará texto extraído en PDFs digitales. Para PDFs escaneados, se incluirá un flujo de OCR local de páginas o imágenes, sujeto a la capacidad del dispositivo. |

Los archivos no se deben enviar a un servidor. La primera versión debe limitarse a archivos con texto real y mostrar de forma explícita cuando no pueda extraer texto.

## Fuentes

- [Expo DocumentPicker](https://docs.expo.dev/versions/latest/sdk/document-picker/)
- [expo-pdf-text-extract](https://github.com/gr8pathik/expo-pdf-text-extract)
- [expo-text-extractor](https://github.com/pchalupa/expo-text-extractor)
- [react-native-pdf-renderer](https://github.com/douglasjunior/react-native-pdf-renderer)
