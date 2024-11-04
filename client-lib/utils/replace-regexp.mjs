
function isRegExp(value) {
	if(!value) {
		return false
	}
	return value instanceof RegExp
}

function transform(regexp) {
	let result = {
		$regex: regexp.source, 
	}
	if(regexp.flags) {
		result.$options = regexp.flags
	}
	return result
}

export default function replaceRegexp(focus) {
	if(!focus) {
		return focus
	}
	
	if(isRegExp(focus)) {
		return transform(focus)
	}
	
	if(typeof focus === 'object') {
		for(let key of Object.keys(focus)) {
			try {
				focus[key] = replaceRegexp(focus[key])	
			}
			// In case we raise an error setting a member
			catch(e) {}
		}
	}

	return focus
}