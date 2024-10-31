import defaultAuthorizationProvider from './authorization-provider.mjs'
import defaultErrorHandler from './default-error-handler.mjs'
import defaultFilter from "./output-filter.mjs";
import defaultTransformer from './output-transformer.mjs'
import defaultMapper from './id-mapper.mjs'
import defaultPreprocessor from './query-preprocessor.mjs'
import filog from 'filter-log'

export default class ServerDataService {
	constructor(options) {


		this.dataService = options.dataService
		this.queryPreprocessor = options.queryPreprocessor || defaultPreprocessor
		this.queryAuthorizationProvider = options.queryAuthorizationProvider || defaultAuthorizationProvider
		this.errorHandler = options.errorHandler || defaultErrorHandler
		this.outputFilter = options.outputFilter || defaultFilter
		this.outputTransformer = options.outputTransformer || defaultTransformer
		this.idMapper = options.idMapper || defaultMapper
		this.configResponseHeaders = (req, res) => {
			res.set('Access-Control-Allow-Origin', '*')
		}

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
			query = this.queryPreprocessor(query, req)
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
			console.log(e)
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
			let query = this.queryPreprocessor(orgQuery, req)
			let authorized = await this.queryAuthorizationProvider(query, req)
			if (!authorized) {
				this.log.info('query denied')
				return this.errorHandler(403, null, req, res, next)
			}

			// let response = await this.dataService._removeByQuery(this.dataService.collections.default, query)
			let response = await this.dataService.remove(query)

			this.configResponseHeaders(req, res)
			res.json(orgQuery)
			res.end()
		}
		catch (e) {
			console.log(e)
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
			// let query = this.queryPreprocessor(orgQuery, req)
			let authorized = await this.queryAuthorizationProvider(null, req)
			if (!authorized) {
				this.log.info('query denied')
				return this.errorHandler(403, null, req, res, next)
			}

			let promises = this.dataService.saveMany(records)

			let result = await Promise.all(promises)
			this.configResponseHeaders(req, res)
			res.json(result)
			res.end()
		}
		catch (e) {
			console.log(e)
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
		router.post('/fetch', this.fetchPOST.bind(this))
		router.delete('/', this.removePOST.bind(this))
		router.post('/', this.savePOST.bind(this))
		return router
	}

}


