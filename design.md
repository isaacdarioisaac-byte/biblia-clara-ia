# Diseño de interfaz — Biblia Clara IA

## Dirección del producto

Biblia Clara IA será una aplicación Android de lectura bíblica centrada en la comprensión. La experiencia debe sentirse serena, legible y directa: el usuario elige un libro y capítulo, lee versículos numerados y toca uno para recibir una explicación en lenguaje cotidiano. La primera versión no requiere cuentas, sincronización ni backend; la información de lectura, preferencias y explicaciones recientes se mantienen en el dispositivo.

## Orientación y principios

La interfaz está diseñada para orientación vertical 9:16 y uso con una sola mano. Las acciones principales deben permanecer en la zona inferior o central de la pantalla, con objetivos táctiles amplios y retroalimentación visual inmediata. Se priorizan tipografía cómoda, contraste alto, espacios generosos entre versículos y una navegación que no obligue al usuario a recordar dónde estaba.

## Pantallas

### 1. Inicio / Continuar leyendo

La pantalla inicial muestra el encabezado “Biblia Clara”, una tarjeta de bienvenida breve, el último capítulo consultado y un botón grande “Continuar leyendo”. Debajo se muestran accesos a “Elegir libro” y “Versículo del día”. El estado del modelo local aparece como una tarjeta discreta: “IA local lista”, “Descargando modelo” o “Descargar IA para explicar versículos”.

### 2. Libros de la Biblia

Una lista agrupada por “Antiguo Testamento” y “Nuevo Testamento” presenta los libros en tarjetas o filas de altura amplia. Cada fila muestra el nombre del libro y la cantidad de capítulos. Un campo de búsqueda en la parte superior permite localizar rápidamente un libro. La selección conduce al selector de capítulos.

### 3. Selector de capítulos

El encabezado muestra el libro seleccionado y una cuadrícula de capítulos con botones grandes. El capítulo actual o el último leído se distingue mediante el color primario. La cuadrícula debe poder desplazarse y conservar una zona cómoda para el pulgar.

### 4. Lector de capítulo

El lector muestra el nombre del libro, el número de capítulo y una barra superior con acciones de volver, marcar capítulo y cambiar tamaño de letra. El contenido usa una columna de lectura amplia, con cada versículo como una fila táctil independiente. El número del versículo aparece en color secundario y el texto en tamaño accesible. Al tocar una fila, se resalta suavemente y se abre el panel de explicación.

### 5. Panel de explicación del versículo

La explicación se presenta como una hoja inferior que puede expandirse. Incluye la referencia, el texto del versículo, la etiqueta “Explicación sencilla” y el resultado de la IA local. Mientras procesa, muestra un indicador de actividad y el mensaje “Preparando una explicación clara…”. Debajo aparecen “Ver contexto del capítulo”, “Guardar” y “Cerrar”. El texto recuerda que se trata de una explicación orientativa y no sustituye el estudio bíblico personal.

### 6. Versículos guardados

Una lista de versículos guardados muestra referencia, fragmento y fecha de guardado. Al tocar uno, la aplicación abre el capítulo y desplaza la lectura hasta ese versículo. Si no hay guardados, se muestra una explicación breve y un acceso para volver al lector.

### 7. Ajustes

Ajustes permite elegir tamaño de letra, tema claro u oscuro, descarga o eliminación del modelo local, idioma de la interfaz y limpieza de explicaciones almacenadas. Debe informar claramente cuánto espacio ocupa el modelo antes de descargarlo.

## Flujos principales

### Leer y explicar un versículo

1. El usuario toca “Continuar leyendo” o elige un libro.
2. Selecciona un capítulo.
3. Toca un versículo concreto.
4. El lector resalta el versículo y abre la hoja inferior.
5. Si el modelo está instalado, la app genera la explicación localmente; si no está instalado, ofrece descargarlo.
6. El usuario lee la explicación, puede guardar el versículo o cerrar la hoja para continuar leyendo.

### Descargar la IA local

1. El usuario toca “Descargar IA” desde Inicio o Ajustes.
2. La app informa que el archivo ocupa aproximadamente 1–2 GB y recomienda Wi‑Fi.
3. El usuario confirma.
4. Se muestra el progreso y la posibilidad de cancelar.
5. Al terminar, el estado cambia a “IA local lista” y se habilita la explicación por versículo.

### Guardar y volver a un versículo

1. Desde la hoja de explicación, el usuario toca “Guardar”.
2. La referencia se almacena localmente.
3. Desde “Guardados”, el usuario toca la referencia.
4. La app abre el libro y capítulo, desplaza el lector al versículo y lo resalta.

## Identidad visual

La marca usará azul noche `#162A46` como color principal, marfil cálido `#FBF8F1` como fondo de lectura, dorado suave `#C79A45` para referencias y estados destacados, y verde salvia `#6B8570` para estados positivos de la IA local. En modo oscuro, el fondo será `#101820`, la superficie `#1A2633`, el texto principal `#F3F0E8` y el dorado se ajustará a `#D7B56D`.

La tipografía debe favorecer la lectura prolongada: encabezados con peso semibold, texto bíblico con tamaño de 18–20 px y altura de línea de aproximadamente 1,5, y explicaciones con 16–18 px. Las tarjetas tendrán esquinas redondeadas moderadas, sombras muy sutiles y bordes de bajo contraste. No se usarán ilustraciones decorativas que compitan con el texto.

## Decisiones de producto

La aplicación usará una traducción de español sencillo que pueda distribuirse legalmente; si no se dispone de una traducción libre adecuada, se incluirá una fuente bíblica compatible o se dejará la importación como una función posterior. La IA se diseñará como módulo local reemplazable: la interfaz funcionará con el estado “modelo no instalado” y no fingirá que existe una explicación generada cuando el modelo todavía no está disponible.
