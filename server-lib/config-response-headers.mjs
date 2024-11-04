export default function configResponseHeaders(req, res) {
	res.set('Access-Control-Allow-Origin', '*')
}