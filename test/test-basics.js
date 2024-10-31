import mocha from "mocha";
import { assert } from 'chai'

describe("tests basic fetch, save, and remove functions", function () {

	it("fetch data", async function () {

		let response = await fetch('http://localhost:3000/data/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			// body: JSON.stringify(order) // body data type must match "Content-Type" header
		})
		let result = await response.json()
		assert.equal(result.length, 2)
		assert.equal(result[1].name, 'a')
	})
	it("fetch queried data", async function () {

		let response = await fetch('http://localhost:3000/data/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ query: { id: '1' } })
		})
		let result = await response.json()
		assert.equal(result.length, 1)
		assert.equal(result[0].name, 'd')

		response = await fetch('http://localhost:3000/data/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ query: '1' })
		})
		result = await response.json()
		assert.equal(result.length, 1)
		assert.equal(result[0].name, 'd')
	})
	it("fetch queried data by id", async function () {

		let response = await fetch('http://localhost:3000/data/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ query: { id: '1' }, idsOnly: true })
		})
		let result = await response.json()
		assert.equal(result.length, 1)
		assert.equal(result[0], '1')

	})
	it("fetch data with output filter", async function () {

		let response = await fetch('http://localhost:3000/data2/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		let result = await response.json()
		assert.equal(result.length, 1)
		assert.equal(result[0].name, 'd')
	})
	it("fetch data with output transformer", async function () {

		let response = await fetch('http://localhost:3000/data2/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		let result = await response.json()
		assert.equal(result.length, 1)
		assert.equal(result[0].why, 'jimmy give it to me')
	})
	it("fetch queried data by id with custom id mapper", async function () {

		let response = await fetch('http://localhost:3000/data2/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ query: { id: '1' }, idsOnly: true })
		})
		let result = await response.json()
		assert.equal(result.length, 1)
		assert.equal(result[0].id, '1')
	})

	it("fetch data with preprocessor limiting data", async function () {

		let response = await fetch('http://localhost:3000/data3/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		let result = await response.json()
		assert.equal(result.length, 1)
		assert.equal(result[0].name, 'a')
	})

	it("test auth failure", async function () {

		let response = await fetch('http://localhost:3000/data4/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		assert.equal(response.status, 403)

		response = await fetch('http://localhost:3000/data4/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": 'Bearer abc'
			},
		})
		assert.equal(response.status, 200)
		let result = await response.json()
		assert.equal(result.length, 2)
		assert.equal(result[1].name, 'a')
	})

	it("remove data", async function () {

		let response = await fetch('http://localhost:3000/data5/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		let result = await response.json()
		assert.equal(result.length, 2)

		response = await fetch('http://localhost:3000/data5', {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ query: "1" } )
		})

		response = await fetch('http://localhost:3000/data5/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		result = await response.json()
		assert.equal(result.length, 1)
		assert.equal(result[0].name, 'a')
	})
	it("save data", async function () {

		let response = await fetch('http://localhost:3000/data5/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		let result = await response.json()
		assert.equal(result.length, 1)

		response = await fetch('http://localhost:3000/data5', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ records: [{
				_id: '1'
				, id: '1'
				, name: 'd'
			}]})
		})
		result = await response.json()

		response = await fetch('http://localhost:3000/data5/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		result = await response.json()
		assert.equal(result.length, 2)
		assert.equal(result[1].name, 'd')
	})
})