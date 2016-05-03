(function(){
	'use strict';
	// Check if the document has already been parsed
	if (document.readyState === 'complete'
	    || document.readyState === 'loaded'
	    || document.readyState === 'interactive') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}

	function init() {

	}
})();
