#!/usr/bin/env node

/*

  This program knows how to update the following versions:

  * upstream
  * Fedora
  * RHEL + EPEL (in the Fedora handler)
  * Ubuntu

  That leaves the following to be manually checked:

  * Debian

  The rest are aliased to various other values.

  Note: this program will not remove information for obsolete distributions.

*/

var https = require('https'),
    fs = require('fs'),
    assert = require('assert'),
    latestNode = require('nodejs-latest'),
    parallel = require('run-parallel'),
    concat = require('concat-stream'),
    cheerio = require('cheerio'),
    merge = require('lodash.merge');

function normalizeVersion(version) {
	if (!version) return;
	return version.split('.').slice(0, 2).join('.');
}

function upstreamHelper(fn, cb) {
	fn().then(o => o.version)
	    .then(v => cb(null, v))
	    .catch(cb);
}

parallel({
	datafile: function(cb) {
		fs.readFile('./data/nodecompat-data.json', function(err, buf) {
			cb(err, JSON.parse(buf.toString()));
		});
	},
	upstream: function(cb) {
		parallel({
			lts: function(cb2) {
				upstreamHelper(latestNode.latestLTS, cb2);
			},
			stable: function(cb2) {
				upstreamHelper(latestNode.latest, cb2);
			}
		}, function(err, obj) {
			cb(err, {'upstream': {'current': obj}});
		});
	},
	ubuntu: function(cb) {
		// XXX exclude Ubuntu releases that are EOL except for Ubuntu Advantage customers
		// Precise Pangolin, I'm looking at you
		https.get('https://launchpad.net/ubuntu/+source/nodejs', function(res) {
			res.on('error', cb);

			assert.equal(res.statusCode, 200);

			res.pipe(concat(function(buf) {
				var $ = cheerio.load(buf.toString());

				var set = {};
				var curDistro;

				$('#packages_list tbody').children().each(function(idx, el) {
					// Dunno what these are but we gotta filter it out for some reason
					if ((el.attribs.id || '').includes('pub')) return;
					if ($(el).text() === '') return;

					if (el.attribs.class.includes('section-heading')) {
						if ($(el).text().includes('active development')) return;
						var fullname = $('td a', el).first().text();
						curDistro = fullname.split(' ')[1].toLowerCase();
					} else {
						// Check if we're processing development versions
						if (!curDistro) return;
						var data = $(el).text().split(' ')
						                       .map(s => s.trim())
						                       .filter(s => s !== '');
						var version = data[0].split('.').slice(0, 2).join('.');

						if (!set[curDistro]) {
							set[curDistro] = {lts: version, stable: null};
						} else {
							assert.equal(set[curDistro].lts, version);
						}
					}
				});
				cb(null, {ubuntu: set});
			}));
		});
	},
	fedora: function(cb) {
		// XXX this API returns unreleased versions of Fedora
		https.get('https://apps.fedoraproject.org/packages/fcomm_connector/bodhi/query/query_active_releases/%7B%22filters%22:%7B%22package%22:%22nodejs%22%7D,%22rows_per_page%22:10,%22start_row%22:0%7D', function(res) {
			res.on('error', cb);

			res.pipe(concat(function(buf) {
				var response = JSON.parse(buf.toString());
				response = response.rows.filter(o => o.stable_version !== 'None')
				                        .filter(o => o.release != 'Rawhide');
				response = response.map(function(obj) {
					var $ = cheerio.load(obj.stable_version);
					var version = $('a:nth-child(1)').text();
					version = normalizeVersion(version);
					var release = obj.release.replace('Fedora ', '').replace('EPEL ', 'epel');

					var inner = {};
					inner[release] = {'lts': version};
					var ret = {};
					ret[release.includes('epel') ? 'redhat' : 'fedora'] = inner;
					return ret;
				});
				cb(null, response);
			}));
		});
	}
}, function(err, results) {
	if (err) throw err;

	var data = results.datafile;
	delete results.datafile;

	Object.values(results).map(el => Array.isArray(el) ? el : [el])
	                      .reduce((a, b) => a.concat(b))
	                      .map(function(obj) {
	                      	// Iterate deep into objects to get at the versions and chop off the patch etc. version components
	                      	for (var i of Object.entries(obj)) {
	                      		for (var j of Object.entries(i[1])) {
	                      			// I'm so sorry
	                      			var versions = obj[i[0]][j[0]];
	                      			versions.lts = normalizeVersion(versions.lts);
	                      			versions.stable = normalizeVersion(versions.stable);
	                      		}
	                      	}
	                      	return obj;
	                      })
	                      .forEach(obj => merge(data.versions, obj));

	fs.writeFileSync('./data/nodecompat-data.json', JSON.stringify(data, null, '\t') + '\n');
});
