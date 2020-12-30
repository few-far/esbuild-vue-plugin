const esbuild = require('esbuild');
const fs = require('fs');
const compiler = require('vue-template-compiler');

/**
 *
 * @param {String} message
 * @param {String} file
 */
function makeOnLoadResultError(message, file) {
	return {
		errors: [
			{
				text: message,
				location: {
					file,
					namespace: 'vue',
				},
			},
		],
	};
}

/**
 * Extracts just the <script> tag from within the .vue file.
 *
 * @param {esbuild.OnLoadArgs} args
 * @returns {esbuild.OnLoadResult}
 */
async function onVueScriptLoad(args) {
	let source;

	try {
		source = (await fs.promises.readFile(args.path.replace(/\?type=script$/, ''))).toString();
	} catch (ex) {
		return makeOnLoadResultError(ex.toString(), args.path);
	}

	const match = /<script>(.*)<\/script>/s.exec(source);

	if (!match) {
		return { contents: 'export default {};' };
	}

	return { contents: match[1] };
}

/**
 * Loads a .vue file, compiling the SFC into a JS module that separately
 * imports each section of the component. Currently only template and script
 * sections are compiled
 *
 * @param {esbuild.OnLoadArgs} args
 * @returns {esbuild.OnLoadResult}
 */
async function onVueLoad(args) {
	let source;

	try {
		source = (await fs.promises.readFile(args.path)).toString();
	} catch (ex) {
		return makeOnLoadResultError(ex.toString(), args.path);
	}

	const templateMatch = /<template>(.*)<\/template>/s.exec(source);

	if (!templateMatch) {
		return makeOnLoadResultError(`${ args.path }' SFC does not contain a <template> tag.`, args.path);
	}

	const compileResult = compiler.compile(templateMatch[1]);

	if (compileResult.errors.length) {
		return {
			errors: compileResult.errors.map(text => ({
				text,
				location: {
					file: args.path,
					namespace: 'vue',
				}
			})),
		};
	}

	return {
		contents: `
			export * from '${args.path}?type=script';
			import Component from '${args.path}?type=script';
			Component.render = function () { ${compileResult.render} };
			// Component.staticRenderFns = [];
			export default Component;
		`,
	};
}

/** @type esbuild.Plugin */
const plugin = {
	name: 'vue',

	setup(build) {
		// In the file namespace, handle any vue file as a module.
		build.onResolve({ filter: /\.vue$/ }, args => ({
			path: `${ args.resolveDir }/${ args.path }`,
			namespace: 'vue',
		}));

		// Handle the individual sections of the SFC as separate imports.
		build.onResolve({ filter: /\.vue\?type=script$/ }, args => ({
			path: `${ args.resolveDir }/${ args.path }`,
			namespace: 'vue',
		}));

		build.onLoad({ filter: /\.vue$/, namespace: 'vue' }, onVueLoad);
		build.onLoad({ filter: /\.vue\?type=script$/, namespace: 'vue' }, onVueScriptLoad);
	},
};

module.exports = plugin;
