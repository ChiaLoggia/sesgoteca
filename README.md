# Sesgoteca

Un archivo de sesgos y conceptos contados con memes. HTML, CSS y JavaScript, sin compilación ni dependencias obligatorias. Diseño adaptable a celular, búsqueda, categorías, tarjetas desplegables, carrusel de videos y editor local.

## Publicar en GitHub

1. Creá un repositorio en tu cuenta (por ejemplo, `sesgoteca`).
2. Subí el contenido de esta carpeta, incluyendo `.github/workflows/pages.yml` y `dist/`.
3. Usá `main` como rama principal. En **Settings → Pages → Build and deployment**, elegí **GitHub Actions**.
4. Ejecutá el workflow «Publicar en GitHub Pages» en Actions o hacé un nuevo commit. La URL aparecerá en el despliegue.

La carpeta `.openai/` corresponde al hosting alternativo de Sites. GitHub Pages publica solamente `dist/`.

## Agregar contenido desde la web

En **Editar colección**, creá o elegí un concepto. Editá nombre, categoría, color, definición y videos (un enlace por línea). Guardar conserva una copia en `localStorage` en ese navegador. No requiere cuenta, ni escribe en GitHub: cada visitante tiene su propia copia local.

Para actualizar lo que ven todos, pulsá **Exportar JSON** y reemplazá `dist/conceptos.json` en GitHub por el archivo descargado. El siguiente despliegue publica los cambios. Quien tenga una copia local anterior puede importar el nuevo JSON para reemplazarla. Borrar los datos del sitio elimina la copia local; exportá para conservarla. Los cambios locales no se sincronizan entre equipos.

## Editar desde el código

`dist/conceptos.json` contiene una lista de objetos:

```json
{
  "id": "mi-concepto",
  "title": "Mi concepto",
  "category": "Conceptos",
  "color": "yellow",
  "definition": "Una explicación breve.",
  "videos": ["videos/mi-meme.mp4"]
}
```

Cada `id` debe ser único, con letras sin acentos, números o guiones. Categorías: `Sesgos`, `Conceptos`, `Heurísticas`. Colores: `red`, `yellow`, `green`, `blue`. Una lista vacía de videos muestra un aviso de contenido pendiente. La colección inicial tiene ocho ejemplos y no incluye memes reales ni videos ajenos de relleno. Las definiciones son borradores educativos editables para adaptar a la bibliografía de tu carrera.

## Dónde poner los videos

- **Google Drive:** pegá el enlace del archivo (`https://drive.google.com/file/d/ID/view`). La página lo convierte al reproductor de Drive. Configurá los permisos del archivo para tus visitantes; la web no cambia permisos. Archivos privados, límites de Drive o procesamiento pendiente pueden impedir reproducirlos. Usá «Abrir video original» si el reproductor falla.
- **YouTube:** enlaces de videos, Shorts o youtu.be. El video debe permitir inserción.
- **MP4/WebM/OGG:** pegá una URL directa HTTPS o agregá el archivo a `dist/videos/` y usá `videos/archivo.mp4`. El servidor debe permitir la reproducción. Para muchos videos o archivos grandes, conviene un alojamiento de video en lugar del repositorio.

No se suben archivos a Drive desde el editor. Se guardan enlaces. La reproducción empieza cuando el visitante da play; cambiar de tarjeta o video detiene el anterior.

## Probar en tu computadora

Con Node instalado, desde esta carpeta:

```sh
node preview.mjs
```

Abrí la URL indicada. No abras `index.html` con doble click: los navegadores pueden bloquear la lectura del JSON bajo `file://`.

## Archivos

- `dist/index.html`: estructura y editor.
- `dist/styles.css`: diseño, paleta y tamaños de pantalla.
- `dist/app.js`: tarjetas, videos, filtros, validación y editor.
- `dist/conceptos.json`: contenido publicado.
- `.github/workflows/pages.yml`: publicación automática.

Las tipografías se solicitan a Google Fonts; si no están disponibles se usan las fuentes del sistema. El editor es para una colección local exportable; para edición compartida y guardado remoto se necesitaría autenticación y un backend.
