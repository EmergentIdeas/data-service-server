import AbstractDataService from '@dankolz/abstract-data-service'
import replaceRegexp from "./utils/replace-regexp.mjs";

export default class RemoteDataService extends AbstractDataService {
	constructor(options) {
		super(options)
		this.urlPrefix = options.urlPrefix
		this.collections = {
			default: {
				collectionName: 'default'
			}
		}
	}
	/**
	 * The internal implementation of saving objects, either insert or update. 
	 * @param {object} collection Could be anyting. An array, a mongo collection, even just a string to 
	 * identify what underlying datastore to use
	 * @param {object} focus An object to save
	 * @returns a promise which resolves to the result of the save, an array of the [result, change-type(update,create), native-result].
	 */
	async _doInternalSave(collection, focus) {
		let response = await fetch(this.urlPrefix, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
				, "Connection": "close"
			},
			body: JSON.stringify({ records: [focus]})
			, cache: 'no-store'
			, mode: 'cors'
		})
		let result = await response.json()
		return result[0]
	}

	/**
	 * The internal implementation of removing objects based on a query.
	 * @param {object} collection Could be anyting. An array, a mongo collection, even just a string to 
	 * identify what underlying datastore to use
	 * @param {object|array} query An object in the mongodb query style, or an array of those objects
	 * @returns a promise which resolves to the result of the delete, generally an internal result object
	 */
	async _doInternalRemove(collection, query) {
		query = replaceRegexp(query)
		let response = await fetch(this.urlPrefix, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
				, "Connection": "close"
			},
			body: JSON.stringify({ query: query })
			, cache: 'no-store'
			, mode: 'cors'
		})
		let result = await response.json()
		return result
	}

	/**
	 * The internal implementation of fetching objects
	 * @param {object} collection Could be anyting. An array, a mongo collection, even just a string to 
	 * identify what underlying datastore to use
	 * @param {object|array} query An object in the mongodb query style, or an array of those objects
	 * @returns a promise which resolves to the result of the fetch, generally an array of result objects.
	 */
	async _doInternalFetch(collection, query) {
		query = replaceRegexp(query)
		let response = await fetch(this.urlPrefix + '/fetch', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
				, "Connection": "close"
			},
			body: JSON.stringify({ query: query })
			, cache: 'no-store'
			, mode: 'cors'
		})
		let result = await response.json()
		return result
	}

	/**
	 * Creates an object to query the db by an object's ID. We're not going to change anything though
	 * and let that all happen on the receiving side.
	 * @param {*} id 
	 * @returns 
	 */
	createIdQuery(id) {
		return id
	}
}