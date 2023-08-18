import express, { Express, RequestHandler } from 'express';
import { ViteDevServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { renderToString } from 'react-dom/server';
import React from 'react';
import serve from 'serve-static';
import { performance, PerformanceObserver } from 'perf_hooks';
import {
  resolveTemplatePath,
  loadSSREntryModule,
  matchPageUrl,
  isProd,
  cwd
} from './util';

const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log('[performance]', entry.name, entry.duration.toFixed(2), 'ms');
  });
  performance.clearMarks();
});

perfObserver.observe({
  entryTypes: ['measure']
});

async function createSSRMiddleware(app: Express): Promise<RequestHandler> {
  let vite: ViteDevServer | null = null;

  if (!isProd) {
    // vite-dev-server
    vite = await (
      await import('vite')
    ).createServer({
      root: process.cwd(),
      server: {
        middlewareMode: 'ssr',
        watch: {
          usePolling: true,
          interval: 100
        }
      }
    });

    app.use(vite.middlewares);
  }

  return async (req, res, next) => {
    try {
      const url = req.originalUrl;
      if (!matchPageUrl(url)) {
        return await next();
      }
      // load server entry
      const { ServerEntry, fetchData } = await loadSSREntryModule(vite);
      // prefetch data
      const data = await fetchData();
      // render component => string
      performance.mark('render-start');
      const appHtml = renderToString(
        React.createElement(ServerEntry, { data })
      );
      performance.mark('render-end');
      performance.measure('renderToString', 'render-start', 'render-end');
      // concat html string response client
      const templatePath = resolveTemplatePath();
      let template = await fs.readFileSync(templatePath, 'utf-8');
      if (!isProd && vite) {
        template = await vite.transformIndexHtml(url, template);
      }
      const html = template
        .replace('<!-- SSR_APP -->', appHtml)
        .replace(
          '<!-- SSR_DATA -->',
          `<script>window.__SSR_DATA__=${JSON.stringify(data)}</script>`
        );
      res.status(200).setHeader('Content-Type', 'text/html').end(html);
    } catch (error: any) {
      vite?.ssrFixStacktrace(error);
      console.error(error);
      res.status(500).end(error.message);
    }
  };
}

async function createServer() {
  const app = express();

  app.use(await createSSRMiddleware(app));

  if (isProd) {
    app.use(serve(path.join(cwd, 'dist/client')));
  }

  app.listen(3000, () => {
    console.log('Node server started...');
    console.log('http://localhost:3000');
  });
}

createServer();
