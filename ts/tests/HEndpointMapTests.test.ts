/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {HEndpointMap} from "../HEndpointMap";
import {type} from "os";
import {HEndpoint} from "../HEndpoint";

test("Single", () => {

	const map = new HEndpointMap();

	map.set("/test", "get", new HEndpoint("", async () => {}));

	expect(map.get("/test", "get")).toBeDefined();
	expect(map.get("/test", "put")).toBeUndefined();
	expect(map.get("/tes", "get")).toBeUndefined();
	expect(map.get("/tes", "delete")).toBeUndefined();

});

test("Multiple", () => {

	const map = new HEndpointMap();

	map.set("/test1", "get", new HEndpoint("", async () => {}));
	map.set("/test2", "put", new HEndpoint("", async () => {}));

	expect(map.get("/test1", "get")).toBeDefined();
	expect(map.get("/test1", "put")).toBeUndefined();
	expect(map.get("/test3", "get")).toBeUndefined();
	expect(map.get("/test3", "put")).toBeUndefined();

	expect(map.get("/test2", "put")).toBeDefined();
	expect(map.get("/test2", "get")).toBeUndefined();
	expect(map.get("/test3", "get")).toBeUndefined();
	expect(map.get("/test3", "put")).toBeUndefined();

});

test("Wildcard End", () => {

	const map = new HEndpointMap();

	map.set("/test/*", "get", new HEndpoint("", async () => {}));

	expect(map.get("/test/xxx", "get")).toBeDefined();
	expect(map.get("/test/yyy", "get")).toBeDefined();
	expect(map.get("/test", "get")).toBeUndefined();
	expect(map.get("/test/xxx", "put")).toBeUndefined();
	expect(map.get("/test/yyy", "put")).toBeUndefined();

});

test("Wildcard Start", () => {

	const map = new HEndpointMap();

	map.set("/*/test", "get", new HEndpoint("", async () => {}));

	expect(map.get("/xxx/test", "get")).toBeDefined();
	expect(map.get("/yyy/test", "get")).toBeDefined();
	expect(map.get("/test", "get")).toBeUndefined();
	expect(map.get("/xxx", "get")).toBeUndefined();
	expect(map.get("/xxx/test", "put")).toBeUndefined();
	expect(map.get("/yyy/test", "put")).toBeUndefined();

});

test("Wildcard Middle", () => {

	const map = new HEndpointMap();

	map.set("/test1/*/test2", "get", new HEndpoint("", async () => {}));

	expect(map.get("/test1/xxx/test2", "get")).toBeDefined();
	expect(map.get("/test1/yyy/test2", "get")).toBeDefined();
	expect(map.get("/test1/xxx/test2", "put")).toBeUndefined();
	expect(map.get("/test1/yyy/test2", "put")).toBeUndefined();
	expect(map.get("/test1/test2", "get")).toBeUndefined();
	expect(map.get("/test1", "get")).toBeUndefined();
	expect(map.get("/test2", "get")).toBeUndefined();

});

test("Too Many Wildcards", () => {

	const map = new HEndpointMap();

	map.set("/test/*", "get", new HEndpoint("", async () => {}));
	let throws = false;

	try {
		map.set("/*/*", "get", new HEndpoint("", async () => {}));
	} catch (e) {
		expect(e).toBeDefined();
		throws = true;
	}

	expect(throws).toBeTruthy();

});