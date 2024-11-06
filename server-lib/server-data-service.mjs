import defaultAuthorizationProvider from './parts/authorization-provider.mjs'
import defaultErrorHandler from './parts/default-error-handler.mjs'
import defaultFilter from "./parts/output-filter.mjs";
import defaultTransformer from './parts/output-transformer.mjs'
import defaultMapper from './parts/id-mapper.mjs'
import defaultPreprocessor from './parts/query-preprocessor.mjs'
import configResponseHeaders from './parts/config-response-headers.mjs'
import saveAuthorizationProivder from './parts/save-authorization-provider.mjs'
import saveRecordsPreprocessor from './parts/save-records-preprocessor.mjs';
import cors from './parts/cors-preprocessor.mjs';
import removeAuthorizationProvider from './parts/remove-authorization-provider.mjs'

import filog from 'filter-log'

/**
 * Accepts http requests to interact with an AbstractDataService
 */
export default class ServerDataService {
	
	/**
	 * 
	 * @param {Object} options 
	 * @param {AbstractDataService} options.dataService The underlying data service
	 * @param {function} options.queryPreprocessor Modify the query before it is run to add constraints
	 * @param {function} options.queryAuthorizationProvider Authorize the user to query records
	 * @param {function} options.saveAuthorizationProvider Authorize the user to save records
	 * @param {function} options.removeAuthorizationProvider Authorize the user to remove records
	 * @param {function} options.errorHandler Respond to the caller if there's an error
	 * @param {function} options.idMapper Determine the ID of a record
	 * @param {function} options.saveRecordsPreprocessor Preprocess records that will be saved to validate or augment them
	 * @param {function} options.outputFilter Remove records from the query
	 * @param {function} options.outputTransformer Transform or augment query results
	 * @param {function} options.corsPreprocessor Handle CORS preflight requests
	 * @param {function} options.configResponseHeaders Add additional headers for CORS or other needs
	 */
	constructor(options) {
		this.dataService = options.dataService

		// Modify the query before it is run to add constraints
		this.queryPreprocessor = options.queryPreprocessor || defaultPreprocessor

		// Authorize the user to query records
		this.queryAuthorizationProvider = options.queryAuthorizationProvider || defaultAuthorizationProvider
		// Authorize the user to save records
		this.saveAuthorizationProvider = options.saveAuthorizationProvider || saveAuthorizationProivder
		// Authorize the user to remove records
		this.removeAuthorizationProvider = options.removeAuthorizationProvider || removeAuthorizationProvider

		// Respond to the caller if there's an error
		this.errorHandler = options.errorHandler || defaultErrorHandler
		// Determine the ID of a record
		this.idMapper = options.idMapper || defaultMapper

		// Preprocess records that will be saved to validate or augment them
		this.saveRecordsPreprocessor = options.saveRecordsPreprocessor || saveRecordsPreprocessor

		// Remove records from the query
		this.outputFilter = options.outputFilter || defaultFilter
		// Transform or augment query results
		this.outputTransformer = options.outputTransformer || defaultTransformer

		// Handle CORS preflight requests
		this.corsPreprocessor = options.corsPreprocessor || cors
		// Add additional headers for CORS or other needs
		this.configResponseHeaders = options.configResponseHeaders || configResponseHeaders 

		this.log = filog('server data service: ')
	}

	async fetchPOST(req, res, next) {
		try {
			let idsOnly = false
			if(req.body) {
				idsOnly = req.body.idsOnly
			}

			let query = req.body.query
			if(typeof query === 'string') {
				query = this.dataService.createIdQuery(query)
			}
			query = this.queryPreprocessor(query, req, 'fetch')
			let authorized = await this.queryAuthorizationProvider(query, req)
			if (!authorized) {
				this.log.info('query denied')
				return this.errorHandler(403, null, req, res, next)
			}

			let records = await this.dataService.fetch(query)
			records = records.filter((item) => {
				return this.outputFilter(item, req, res)
			})
				
			records = await this.outputTransformer(records, req)

			// remove any blanks
			records = records.filter(record => !!record)

			if (idsOnly) {
				records = records.map(this.idMapper)
			}
			
			this.configResponseHeaders(req, res)

			res.json(records)
			res.end()
		}
		catch (e) {
			this.log.error({
				error: e
				, msg: 'could not query ' + e.message
			})
			this.log.info({
				msg: 'org query'
				, query: req.body.query
			})
		}
		finally {
		}
	}

	async removePOST(req, res, next) {
		try {
			let orgQuery = req.body.query
			let query = this.queryPreprocessor(orgQuery, req, 'remove')
			let authorized = await this.removeAuthorizationProvider(query, req)
			if (!authorized) {
				this.log.info('remove denied')
				return this.errorHandler(403, null, req, res, next)
			}

			let response = await this.dataService.remove(query)

			this.configResponseHeaders(req, res)
			res.json(orgQuery)
			res.end()
		}
		catch (e) {
			this.log.error({
				error: e
				, msg: 'could not remove ' + e.message
			})
			this.log.info({
				msg: 'org remove query'
				, query: req.body.query
			})
		}
		finally {
		}
		
	}

	async savePOST(req, res, next) {
		try {
			let records = req.body.records
			let authorized = await this.saveAuthorizationProvider(records, req)
			if (!authorized) {
				this.log.info('save denied')
				return this.errorHandler(403, null, req, res, next)
			}
			
			records = await this.saveRecordsPreprocessor(records, req)

			let promises = this.dataService.saveMany(records)

			let result = await Promise.all(promises)

			this.configResponseHeaders(req, res)
			res.json(result)
			res.end()
		}
		catch (e) {
			this.log.error({
				error: e
				, msg: 'could not save ' + e.message
			})
			this.log.info({
				msg: 'org records'
				, query: req.body
			})
		}
		finally {
		}
	}

	/**
	 * Adds the listeners to an express router
	 * @param {Router} router 
	 * @returns 
	 */
	addToRouter(router) {
		router.use(this.corsPreprocessor)
		router.post('/fetch', this.fetchPOST.bind(this))
		router.delete('/', this.removePOST.bind(this))
		router.post('/', this.savePOST.bind(this))
		return router
	}

}


