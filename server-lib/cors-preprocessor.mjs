export default function cors(req, res, next) {
	if (req.method === 'OPTIONS') {
		res.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
		res.set('Access-Control-Allow-Origin', '*')
		res.set('Access-Control-Allow-Headers', 'Content-type,Connection,Authorization')
		res.set('Access-Control-Max-Age', 600) 
		res.end()
	}
	else {
		next()
	}
}