import RemoteDataService from '../client-lib/remote-data-service.mjs'
import mocha from 'mocha'
import { expect, assert } from 'chai'
import EventEmitter from 'events'

export default function stdOps(url) {
	let p = new Promise(async (resolve, reject) => {
		try {
			let events = new EventEmitter()
			let serv = new RemoteDataService({
				notification: events
				, urlPrefix: url
			})

			events.on('object-change', (one, two) => {
				// console.log(`object change: ${JSON.stringify(one)} ${two}`)
			})

			// Do a full cleanup
			await serv.remove({})

			let dat = {
				msg: 'hello'
			}
			let [r] = await serv.save(Object.assign({}, dat))
			assert.isNotNull(r._id)
			// Make sure we have an independent id
			assert.isNotNull(r.id)
			let id = r._id
			let id2 = r.id

			let result = await serv.fetch()
			assert.equal(result.length, 1)

			result = await serv.fetchOne(id)
			assert.equal(result.msg, 'hello')

			result = await serv.fetchOne(id.toString())
			assert.equal(result.msg, 'hello')

			result.msg = 'hi'
			await serv.save(result)

			result = await serv.fetchOne(id.toString())
			assert.equal(result.msg, 'hi')

			result = await serv.fetchOne({ id: id2 })
			assert.equal(result.msg, 'hi')

			result = await serv.fetchOne(id2)
			assert.equal(result.msg, 'hi')

			result = await serv.remove(id.toString())

			result = await serv.fetchOne(id.toString())
			assert.isNull(result)


			let promises = serv.saveMany([
				{ msg: 'hello' }
				, { msg: 'world' }
			])
			await Promise.all(promises)

			result = await serv.fetch()
			assert.equal(result.length, 2)

			let ids = result.map(item => item.id)
			let ids2 = result.map(item => item._id.toString())

			result = await serv.fetch({})
			assert.equal(result.length, 2)

			result = await serv.fetchOne(ids)
			assert.isNotNull(result)

			result = await serv.fetchOne(ids2)
			assert.isNotNull(result)

			result = await serv.fetch(serv.createIdQuery(ids))
			assert.equal(result.length, 2)

			result = await serv.fetch(serv.createIdQuery(ids2))
			assert.equal(result.length, 2)

			result = await serv.fetch({ name: 'Kolz' })
			assert.equal(result.length, 0)
		}
		catch (e) {
			console.log(e)
			return reject('error')
		}
		resolve()
	})
	return p
}