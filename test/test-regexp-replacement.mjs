
import mocha from "mocha";
import { assert } from 'chai'
import replaceRegexp from "../server-lib/utils/replace-regexp.mjs";

describe("test regexp replacement", function () {
	
	it("regexp only", function () {
		assert.equal(replaceRegexp(/hel/).$regex, 'hel')	

		assert.equal(replaceRegexp(/hel/i).$options, 'i')	
	})	
	it("member", function () {
		assert.equal(replaceRegexp({msg: /hel/i}).msg.$regex, 'hel')	
	})

	it("deep member", function () {
		assert.equal(replaceRegexp({query: {msg: /hel/i}}).query.msg.$regex, 'hel')	
	})
	it("string", function () {
		assert.equal(replaceRegexp('hel'), 'hel')	
	})

})