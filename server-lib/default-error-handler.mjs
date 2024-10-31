let defaultErrorHandler = (status = 404, caughtException, req, res, next, msg = "Not Found") => {
	let err = new Error(msg)
	err.status = status
	err.originalError = caughtException
	if(status == 404) {
		next(err)
	}
	else {
		res.status(err.status)
		res.end()
	}
}

export default defaultErrorHandler
