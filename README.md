# Data Service Server

A server component to allow access over HTTP to any AbstractDataService and client code
to call the server side. Allows web clients to treat a server side database is if it were
local.

## Install

```bash
npm install @dankolz/data-service-server
```


## Server side usage

```js
import ServerDataService from '@dankolz/data-service-server'

let server = new ServerDataService({
	dataService: the-underlying-store
})
let serviceRouter = express.Router()
server.addToRouter(serviceRouter)
app.use('/my-data-url', serviceRouter)
```

There are several storage mechanism that implement AbstractDataService including
MongoDB and an in-memory store.

## Client side usage

```js
import RemoteDataService from '@dankolz/data-service-server'
// or import RemoteDataService from '@dankolz/data-service-server/client-lib/remote-data-service.mjs'
let serv = new RemoteDataService({
	urlPrefix: '/my-data-url'
})

let results = await serv.fetch({name: 'Dan'})
// ...etc
```

## Options

There are a bunch of options for security and transforming the objects sent and received. Check the
constructors for documentation of the options.

## Notes

See [AbstractDataService](https://www.npmjs.com/package/@dankolz/abstract-data-service) or 
[MongodbDataService](https://www.npmjs.com/package/@dankolz/mongodb-data-service) for usage
examples.

Data sent over http is transformed when serialized. Dates become strings. IDs become strings.
Complex objects may be lost altogether. Use the `presaveTransformer` and `postfetchTransformer`
options to mitigate that problem.



