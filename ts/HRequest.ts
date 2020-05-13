/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as HTTP from "http";
import {HMethod} from "@element-ts/hydrogen-core";
import {HServer} from "./HServer";
import * as Crypto from "crypto";

export class HRequest {

	private readonly _request: HTTP.IncomingMessage;
	private _payload: Buffer | undefined;
	private readonly _id: string;
	private _endpoint: string | undefined;

	public constructor(request: HTTP.IncomingMessage) {

		this._request = request;
		this._id = Crypto.randomBytes(4).toString("hex");

	}

	public rawRequest(): HTTP.IncomingMessage {

		return this._request;

	}

	public headers(): HTTP.IncomingHttpHeaders {

		return this._request.headers;

	}

	public token(): string | undefined {

		const authHeader = this.headers().authorization;
		if (authHeader === undefined) return;
		const authHeaderArray = authHeader.split(" ");

		return authHeaderArray[1];

	}

	public url(): string {

		const url = this._request.url;
		if (url === undefined) throw new Error("Incoming request's url is undefined.");

		return url;

	}

	public endpoint(): string {

		return this.url().split("?")[0];

	}

	public path(index: number): string | undefined {

		return this.endpoint().substring(1).split("/")[index];

	}

	public wildcard(): string {

		if (this._endpoint !== undefined) {
			const providedPaths = this.endpoint().substring(1).split("/");
			const realPaths = this._endpoint.substring(1).split("/");
			for (let i = 0; i < providedPaths.length; i ++) {
				if (providedPaths[i] !== realPaths[i]) return providedPaths[i];
			}
		}

		throw new Error("Could not find wildcard for request.");

	}

	public ip(): string {

		const ip = this._request.connection.remoteAddress;
		if (ip === undefined) throw new Error("Incoming request's ip is undefined.");

		return ip.replace("::ffff:", "");

	}

	public method(): HMethod {

		let method = this._request.method;
		if (method === undefined) throw new Error("Incoming request's method is undefined.");
		method = method.toLowerCase();

		return method as HMethod;

	}

	public setEndpoint(endpoint?: string): void {

		this._endpoint = endpoint;

	}

	public payload(): Buffer | undefined {

		return this._payload;

	}

	public param(): any {

		if (this.method() === "get") {

			HServer.logger.log(`${this.id()}: Request is a get, parsing url.`);

			const fullUrl = this.url();
			let urlSearchParams = fullUrl.split("?")[1];
			if (urlSearchParams === undefined) return undefined;
			urlSearchParams = urlSearchParams.replace("param=", "");
			const urlBody = `{"param":"${urlSearchParams}"}`;
			const body = JSON.parse(urlBody);
			const param: any = body["param"];

			const paramInt = parseInt(param);
			if (!Number.isNaN(paramInt)) {
				return paramInt;
			}

			const paramFloat = parseFloat(param);
			if (!Number.isNaN(paramFloat)) {
				return paramFloat;
			}

			return param;

		}

		if (this._payload === undefined) {
			HServer.logger.log(`${this.id()}: Request's payload was undefined.`);
			return undefined;
		}

		let body: { param?: any };

		try {
			HServer.logger.log(`${this.id()}: Will parse request of ${this._payload.length} bytes.`);
			const bodyString = this._payload.toString("utf8");
			HServer.logger.log(`${this.id()}: Did convert body to string of length '${bodyString.length}'.`);
			body = JSON.parse(bodyString);
		} catch (e) {
			throw new Error(e);
		}

		HServer.logger.log(`${this.id()}: Did parse request body.`);

		const param = body["param"];

		if (param === undefined) {
			HServer.logger.log(`${this.id()}: Request's body did not contain a param key.`);
			return undefined;
		}

		HServer.logger.log(`${this.id()}: Found param key.`);
		return param;

	}

	public setPayload(data: Buffer): void {

		this._payload = data;

	}

	public toString(): string {
		return `${this.id()}: HRequest { url: ${this.url()}, method: ${this.method()}, ip: ${this.ip()}}`;
	}

	public id(): string {

		return this._id;

	}

}