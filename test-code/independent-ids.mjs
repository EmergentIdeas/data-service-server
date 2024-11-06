import RemoteDataService from '../client-lib/remote-data-service.mjs'
import mocha from 'mocha'
import { expect, assert } from 'chai'

export default function independentIds(url) {
	let serv = new RemoteDataService({
		urlPrefix: url
	})
	assert.equal(serv.useIndependentIds, true)

	let id = serv.generateId()
	assert.isNotNull(id)

	serv = new RemoteDataService({
		useIndependentIds: false
		, urlPrefix: url
	})
	assert.equal(serv.useIndependentIds, false)

}