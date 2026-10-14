import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const root = (path) => fileURLToPath(new URL(path, import.meta.url));
const PARTIALS_DIR = root('./src/partials/');

/** Reemplaza `<!-- @include archivo.html -->` por el contenido de src/partials/archivo.html */
function htmlPartials() {
	return {
		name: 'html-partials',
		transformIndexHtml: {
			order: 'pre',
			handler: (html) =>
				html.replace(/<!--\s*@include\s+([\w.-]+)\s*-->/g, (_, file) => readFileSync(PARTIALS_DIR + file, 'utf8')),
		},
		handleHotUpdate({ file, server }) {
			if (file.includes('/src/partials/')) {
				server.ws.send({ type: 'full-reload' });
				return [];
			}
		},
	};
}

/** `/catalog-b2b` → `/catalog-b2b/` en dev y preview, como hacen IIS o Netlify en producción */
function trailingSlash() {
	const middleware = (baseDir) => (req, res, next) => {
		const [path, query = ''] = req.url.split('?');
		if (!path.endsWith('/') && !path.includes('.') && existsSync(join(baseDir, path, 'index.html'))) {
			res.writeHead(301, { Location: `${path}/${query && `?${query}`}` });
			return res.end();
		}
		next();
	};
	return {
		name: 'trailing-slash',
		configureServer: (server) => void server.middlewares.use(middleware(server.config.root)),
		configurePreviewServer: (server) =>
			void server.middlewares.use(middleware(join(server.config.root, server.config.build.outDir))),
	};
}

export default defineConfig({
	appType: 'mpa',
	plugins: [htmlPartials(), trailingSlash(), tailwindcss()],
	assetsInclude: ['**/*.gltf'],
	build: {
		target: 'es2022',
		// three.js se carga de forma diferida en su propio chunk
		chunkSizeWarningLimit: 700,
		rolldownOptions: {
			input: {
				inicio: root('./index.html'),
				'catalog-b2b': root('./catalog-b2b/index.html'),
			},
		},
	},
});
