/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {HMethod} from "@element-ts/hydrogen-core";
import {HEndpoint} from "./HEndpoint";

export class HEndpointMap {

	private map: Map<string, Map<string, HEndpoint>>;

	public constructor() {

		this.map = new Map<string, Map<string, HEndpoint>>();

	}

	private getEndpointMap(endpoint: string, lastWildcard?: string): Map<string, HEndpoint> | undefined {

		const endpoints = this.map.get(endpoint);
		if (endpoints !== undefined) return endpoints;

		const endpointPaths = endpoint.split("/");

		if (endpointPaths[0] === "*") return undefined;

		const indexOfWildcard = endpointPaths.indexOf("*");
		let nextWildcard: string | undefined;

		if (indexOfWildcard === -1) {
			nextWildcard = endpointPaths[endpointPaths.length - 1];
			endpointPaths[endpointPaths.length - 1] = "*";
		} else {
			endpointPaths[indexOfWildcard] = lastWildcard ?? "*";
			nextWildcard = endpointPaths[indexOfWildcard - 1];
			endpointPaths[indexOfWildcard - 1] = "*";
		}

		const rebuiltEndpoint = endpointPaths.join("/");

		return this.getEndpointMap(rebuiltEndpoint, nextWildcard);

	}

	public set(endpoint: string, method: HMethod, obj: HEndpoint): void {

		HEndpointMap.checkForOneWildcard(endpoint);
		let methodsForEndpoint = this.map.get(endpoint);
		if (methodsForEndpoint === undefined) methodsForEndpoint = new Map<string, HEndpoint>();
		methodsForEndpoint.set(method, obj);
		this.map.set(endpoint, methodsForEndpoint);

	}

	public get(endpoint: string, method: HMethod): HEndpoint | undefined {

		if (endpoint.charAt(endpoint.length - 1) === "/") endpoint = endpoint.substring(0, endpoint.length - 2);
		const endpointSections = endpoint.split("?");
		const realEndpoint = endpointSections[0];

		const endpointMap = this.getEndpointMap(realEndpoint);
		if (endpointMap === undefined) return undefined;

		return endpointMap.get(method);

	}

	private static checkForOneWildcard(endpoint: string): void {

		let wildcards = 0;
		for (const char of endpoint.split("/")) {
			if (char === "*") wildcards++;
			if (wildcards > 1) throw new Error("You can only have one wildcard in an endpoint.");
		}

	}

}