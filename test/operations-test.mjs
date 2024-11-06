import independentIds from '../test-code/independent-ids.mjs'
import stdOps from '../test-code/std-ops.mjs'
import siftTests from '../test-code/sift-tests.mjs'

function show(dat) {
	console.log(JSON.stringify(dat, null, '\t'))

}

let urlPrefix = 'http://localhost:3000/data'

function setup() {
	describe("basic data operations", async function () {

		it("independent ids", function () {
			independentIds(urlPrefix + "6")
		})

		it("ops", async function () {
			let p = stdOps(urlPrefix + "6")
			return p
		})
		it("ops with sift in memory", async function () {
			return siftTests(urlPrefix + 7)
		})
		it("ops with mongo", async function () {
			return siftTests(urlPrefix + 8)
		})
	})
}
setup()

