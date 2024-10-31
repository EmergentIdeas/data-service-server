
import path from "path"
import express from "express"
import filog from "filter-log"
import loadTemplates from "./add-templates.js"
import webhandle from "webhandle"

import group1 from '../test-data/group-1.mjs'
import InMemoryDataService from '@dankolz/in-memory-data-service'
import InMemoryDataServiceSift from '@dankolz/in-memory-data-service/lib/in-memory-data-service-sift.mjs'
import ServerDataService from '../server-lib/server-data-service.mjs'
import authorizationProvider from "../server-lib/authorization-provider.mjs"

let log

export default function (app) {
	log = filog('unknown')

	// add a couple javascript based tripartite templates. More a placeholder
	// for project specific templates than it is a useful library.
	loadTemplates()

	webhandle.routers.preStatic.get(/.*\.cjs$/, (req, res, next) => {
		console.log('cjs')
		res.set('Content-Type', "application/javascript")
		next()
	})



	let server = new ServerDataService({
		dataService: new InMemoryDataService({
			collections: {
				default: [...group1]
			}
		})
	})
	let serviceRouter = express.Router()
	server.addToRouter(serviceRouter)
	app.use('/data', serviceRouter)

	server = new ServerDataService({
		dataService: new InMemoryDataService({
			collections: {
				default: [...group1]
			}
		})
		, outputFilter: (item, req, res) => {
			if (item.name == 'a') {
				return false
			}
			return true
		}
		, async outputTransformer(items, req, res) {
			items.forEach(item => item.why = 'jimmy give it to me')
			return items
		}
		, idMapper({ _id, id }) {
			return {
				_id
				, id
			}
		}
	})

	serviceRouter = express.Router()
	server.addToRouter(serviceRouter)
	app.use('/data2', serviceRouter)


	server = new ServerDataService({
		dataService: new InMemoryDataService({
			collections: {
				default: [...group1]
			}
		})
		, queryPreprocessor(query, req) {
			query = query || {}
			query.id = '2'

			return query
		}
	})

	serviceRouter = express.Router()
	server.addToRouter(serviceRouter)
	app.use('/data3', serviceRouter)


	server = new ServerDataService({
		dataService: new InMemoryDataService({
			collections: {
				default: [...group1]
			}
		})
		, async queryAuthorizationProvider(query, req) {
			let authHeader = req.get('Authorization')
			if (authHeader) {
				return true
			}
			return false
		}
	})
	serviceRouter = express.Router()
	server.addToRouter(serviceRouter)
	app.use('/data4', serviceRouter)


	server = new ServerDataService({
		dataService: new InMemoryDataService({
			collections: {
				default: [...group1]
			}
		})
	})
	serviceRouter = express.Router()
	server.addToRouter(serviceRouter)
	app.use('/data5', serviceRouter)


	server = new ServerDataService({
		dataService: new InMemoryDataServiceSift({
			collections: {
				default: []
			}
		})
	})
	serviceRouter = express.Router()
	server.addToRouter(serviceRouter)
	app.use('/data6', serviceRouter)
	

	server = new ServerDataService({
		dataService: new InMemoryDataServiceSift({
			collections: {
				default: []
			}
		})
	})
	serviceRouter = express.Router()
	server.addToRouter(serviceRouter)
	app.use('/data7', serviceRouter)
}





