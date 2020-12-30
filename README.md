# Vue plugin for [esbuild](https://esbuild.github.io/)

Supports compiling simple Single File Component .vue files in with esbuild.

```
<template>
	<div></div>
</template>

<script>
	export default {};
</script>
```

Script section is created as virtual file to export and template is compiled using [`vue-template-compiler`](https://www.npmjs.com/package/vue-template-compiler):

```
export * from '${args.path}?type=script';
import Component from '${args.path}?type=script';
Component.render = function (createElement) { return createElement('div'); };
export default Component;
```

## Usage

```
$ npm install --save-dev "vue-template-compiler@2"
```

[Follow instructions](https://esbuild.github.io/plugins/#using-plugins) on using esbuild plugins.

## Limitations

Does not support:

 - Any attribute on `<template>` section.
 - Any attribute on `<script>` section.
 - `<style>` sections.
 - Compile time directives.

## License

Copyright (C) 2020 Thomas Nadin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
