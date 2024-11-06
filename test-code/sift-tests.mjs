import RemoteDataService from '../client-lib/remote-data-service.mjs'
import mocha from 'mocha'
import { expect, assert } from 'chai'
import EventEmitter from 'events'

export default function siftTests(url) {
	let p = new Promise(async (resolve, reject) => {
		try {
			let events = new EventEmitter()
			events.on('object-change', (one, two) => {
				// console.log(`object change: ${JSON.stringify(one)} ${two}`)
			})

			let dat = {
				msg: 'hello'
			}

			let serv = new RemoteDataService({
				notification: events
				, urlPrefix: url
			})

			await serv.remove({})

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


			result = await serv.fetchOne({ msg: 'hello' })
			assert.equal(result.msg, 'hello')

			result = await serv.fetchOne({ msg: 'hello!' })
			assert.isNull(result)

			result = await serv.fetchOne({ msg: /hel/ })
			assert.equal(result.msg, 'hello')

			result = await serv.fetchOne({ msg: { "$regex": "hel" } })
			assert.equal(result.msg, 'hello')

			result.msg = 'hi'
			r = (await serv.save(result))[0]
			id = r._id
			id2 = r.id
			
			let objs = await serv.fetch()
			assert.equal(objs.length, 1)

			result = await serv.fetchOne(id.toString())
			assert.equal(result.msg, 'hi')

			result = await serv.fetchOne({ id: id2 })
			assert.equal(result.msg, 'hi')

			result = await serv.fetchOne(id2)
			assert.equal(result.msg, 'hi')

			result = await serv.remove(id.toString())

			result = await serv.fetchOne(id.toString())
			assert.isFalse(!!result)


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

			console.time('fetch by id')
			result = await serv.fetchOne(ids)
			console.timeEnd('fetch by id')
			assert.isNotNull(result)

			result = await serv.fetchOne(ids2)
			assert.isNotNull(result)

			result = await serv.fetch(serv.createIdQuery(ids))
			assert.equal(result.length, 2)

			result = await serv.fetch(serv.createIdQuery(ids2))
			assert.equal(result.length, 2)

			result = await serv.fetch({ name: 'Kolz' })
			assert.equal(result.length, 0)


			await serv.save({ name: 'Kolz', count: 1 })
			result = await serv.fetch({ name: 'Kolz' })
			assert.equal(result.length, 1)
			assert.equal(result[0].count, 1)

			await serv.save({ name: 'Kolz', count: 2 })
			await serv.save({ name: 'Kolz', count: 3 })
			console.time('fetch by name')
			result = await serv.fetch({ name: 'Kolz' })
			console.timeEnd('fetch by name')
			assert.equal(result.length, 3)

			result = await serv.fetch({})
			assert.equal(result.length, 5)
			console.time('fetch all')
			result = await serv.fetch()
			console.timeEnd('fetch all')
			assert.equal(result.length, 5)

			await serv.remove({})
			result = await serv.fetch()
			assert.equal(result.length, 0)

			await serv.save({ name: 'Kolz', count: 2 })
			await serv.save({ name: 'Kolz', count: 3 })
			result = await serv.fetch({ name: 'Kolz' })
			assert.equal(result.length, 2)

			await serv.remove()
			result = await serv.fetch()
			assert.equal(result.length, 0)


			let buffer = new Uint8Array(10)
			crypto.getRandomValues(buffer)
			let file = {
				content: buffer
			}
			// console.log(buffer)
			await serv.save(file)
			let file2 = await serv.fetchOne(file.id)
			// console.log(file2.content)

		}
		catch (e) {
			console.log(e)
			return reject('error')
		}
		resolve()
	})
	return p
}
