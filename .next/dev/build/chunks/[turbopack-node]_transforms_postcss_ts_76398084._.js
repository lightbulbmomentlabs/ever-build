module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Ever-Build-App/postcss.config.js_.loader.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/5f4a7__pnpm_6f1fa9df._.js",
  "chunks/[root-of-the-server]__5416fdc0._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Ever-Build-App/postcss.config.js_.loader.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];