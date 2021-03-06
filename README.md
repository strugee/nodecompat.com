# nodecompat.com

Quoting from the main page:

> Have a list of Linux distributions you'd like to run on, but not sure what Node versions you have to support? Or maybe that, but in reverse? No problem. nodecompat.com has you covered.

Originally inspired by the fact that in the [Pump.io project][1], we didn't know what minimum Node version we should support because we didn't know what different distros shipped.

## Developing

To build the project, you need Node and `npm` (shocker). If you don't already have [Gulp][2] installed, install it with `npm install -g gulp`. Then run `npm install` in your clone, followed by `gulp watch`. The output files are in `dist/`.

Here's what that does:

1. Compile [Jade][3] starting from `src/index.jade`, passing the deserialized version of `data/nodecompat-data.json` as the Jade "data" parameter
2. Compile [Stylus][4] in `src/styles/`
3. (If you're on the `version-selector` branch) Compile a [Browserify][5] bundle starting from `src/scripts/main.js`

### Adding new distributions

Adding a new distribution is pretty easy - you just have to have some basic JSON skills. `data/nodecompat-data.json` contains an object with two keys: `versions` and `distros`. `versions` contains the actual version data, while `distros` contains things like pretty names to display instead of ugly internal identifiers.

`versions` contains an object with keys for each distro. Each distro key is an object with keys for each distro version, and each distro version has a `stable` key and an `lts` key. What these mean on a semantic level depends on the distro - the human-readable descriptions for them are specified per-distro in `distros`.

Alternately, instead of a `stable` and `lts` key, a distro can have an `alias` key which is a string of the form `<distro>.<distro_version>`. These aliases are resolved by the Jade templates at build-time. You can specify that Node isn't packaged in a particular distro version by specifying `null` instead of a string.

`distros`, again, contains an object with keys for each distro. Each of these keys' values is an object that has these properties:

* `prettyname`, a human-readable long-form name for the distro
* `stabledesc`, a description of what the `stable` version means for that particular distribution
* `ltsdesc`, ditto for the `lts`; version
* `versions`, which contains a key for each supported version of the distribution whose value is an object with one key, `prettyname`, which is a (short) human-readable string that names that version

The distribution identifiers in `distros` match those in `versions`, and the version names in `distros[distro].versions` match the version names in `versions[distro]`.

If a distribution has a rolling release version (possibly that's its _only_ version), its version key name should be `current` and should be aliased to `upstream.current`, and its `prettyname` should be `<em>Rolling release</em>`. Using codenames as internal version names (read: JSON key names) is fine, but don't put them in `prettyname`s. Don't be afraid to put `<code>` tags in `stabledesc` or `ltsdesc`; they won't be escaped and will make it through to the HTML.

Look at the JSON file for examples. It'll help you make sense of the above.

 [1]: http://pump.io
 [2]: http://gulpjs.com
 [3]: http://jade-lang.com
 [4]: http://stylus-lang.com
 [5]: http://browserify.org
