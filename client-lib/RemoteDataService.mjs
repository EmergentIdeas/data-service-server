import AbstractDataService from '@dankolz/abstract-data-service'
import replaceRegexp from "./utils/replace-regexp.mjs";

export default class RemoteDataService extends AbstractDataService {
	constructor(options) {
		super(options)
		this.urlPrefix = options.urlPrefix
		if(!options.collections) {
			this.collections = {
				default: {
					collectionName: 'default'
				}
			}
		}
		this.closeConnection = options.closeConnection || false
		this.cacheValue = options.cacheValue 
	}
	
	/**
	 * Adds headers to the request for caching and connection
	 * @param {Request} request 
	 */
	addExtraHeaders(request) {
		if(this.closeConnection) {
			request.headers['Connection'] = 'close'
		}
		if(this.cacheValue) {
			request.headers['cache'] = this.cacheValue
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
		let request = {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ records: [focus]})
			, mode: 'cors'
		}
		this.addExtraHeaders(request)

		let response = await fetch(this.urlPrefix, request)
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
		let request = {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ query: query })
			, mode: 'cors'
		}
		this.addExtraHeaders(request)

		let response = await fetch(this.urlPrefix, request)
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
		let request = {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ query: query })
			, mode: 'cors'
		}
		this.addExtraHeaders(request)

		let response = await fetch(this.urlPrefix + '/fetch', request)
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