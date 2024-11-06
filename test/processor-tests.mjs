
import mocha from "mocha";
import { assert } from 'chai'

import RemoteDataService from '../client-lib/remote-data-service.mjs'

let url = "http://localhost:3000/data9"

describe("tests pre and post processors and like options", function () {

	it("Auth tokens and transformers", async function () {
		let opPass = false
		let serv = new RemoteDataService({
			urlPrefix: url
		})
		
		try {
			opPass = false
			await serv.remove({})
			opPass = true
		}
		catch(e) { }
		assert.isFalse(opPass, 'The remove should have failed because it was unauthorized')
		

		let removeServ = new RemoteDataService({
			urlPrefix: url
			, authToken: '789'
		})
		await removeServ.remove({})
		
		try {
			opPass = false
			await serv.save({name: 'Dan'})
			opPass = true
		}
		catch(e) {}
		assert.isFalse(opPass, 'The save should have failed because it was unauthorized')

		let saveServ = new RemoteDataService({
			urlPrefix: url
			, authToken: '456'
			, async presaveTransformer(records) {
				console.log('presave')
				for(let r of records) {
					if(!r.creationDate) {
						r.creationDate = new Date()
					}
				}
				return records
			}
		})
		await saveServ.save({name: 'Dan'})
		
		try {
			opPass = false
			await serv.fetch({})
			opPass = true
		}
		catch(e) {}
		
		assert.isFalse(opPass, 'The fetch should have failed because it was unauthorized')

		serv = new RemoteDataService({
			urlPrefix: url
			, authToken: '123'
			, async postfetchTransformer(records) {
				for(let r of records) {
					if(r.lastChange) {
						r.lastChange = new Date(r.lastChange)
					}
				}
				return records
			}
		})
		
		let results = await serv.fetch({})
		assert.equal(results.length, 1)

		let dan = results[0]
		assert.equal(dan.name, 'Dan')
		assert(!!dan.lastChange, 'Last change data should be set.')
		
		assert(dan.lastChange instanceof Date, 'Last change should be a date')

		assert(!!dan.creationDate, "Should have gotten saved with a creation date")
		
		
	})
})
