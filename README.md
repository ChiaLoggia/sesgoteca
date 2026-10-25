# Colección de conceptos

Página estática en HTML, CSS y JavaScript. Conserva la paleta retro y la textura de papel. La interfaz pública muestra filtros, búsqueda y tarjetas con el nombre del concepto; al abrirlas aparecen el video y la definición.

## Edición de contenido

El sitio público es de solo lectura y no incluye editor ni guardado local. Las versiones anteriores guardadas en el navegador ya no se usan. Solo las cuentas autorizadas a escribir en este repositorio pueden cambiar el contenido publicado.

Editá dist/conceptos.json desde tu cuenta de GitHub. Cada concepto tiene id, title, category, color, definition y videos (una lista de enlaces). Conservá los id únicos.

- Categorías: Sesgos, Conceptos, Heurísticas.
- Colores: red, yellow, green, blue.
- Videos: enlaces de archivos de Drive, YouTube, o MP4/WebM/OGG directos. Para archivos en el repositorio, agregalos a dist/videos/ y usá videos/archivo.mp4.
- Drive debe permitir el acceso a los visitantes que deban ver el archivo. La página no cambia sus permisos.
- Una lista de videos vacía muestra un espacio neutro sin instrucciones de edición.

Guardar un commit en main publica automáticamente en GitHub Pages mediante el workflow incluido. En Settings → Pages debe estar seleccionado GitHub Actions.

## Desarrollo local

Con Node instalado ejecutá node preview.mjs desde esta carpeta. Abrí la dirección indicada; no abras index.html directamente porque la carga del JSON necesita HTTP.

dist/index.html: estructura. dist/styles.css: diseño. dist/app.js: filtros, tarjetas y videos. dist/conceptos.json: contenido.

Las tipografías usan Google Fonts con alternativas del sistema. Las definiciones iniciales son borradores educativos editables. Los videos reales todavía deben agregarse.
