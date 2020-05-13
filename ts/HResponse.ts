/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as HTTP from "http";
import {HRequest} from "./HRequest";

export class HResponse {

	private readonly _req: HRequest;
	private readonly _res: HTTP.ServerResponse;
	private _statusCode: number;
	private _headers: object;

	public constructor(req: HRequest, res: HTTP.ServerResponse) {

		this._req = req;
		this._res = res;
		this._statusCode = 200;
		this._headers = req.headers();

	}

	public setStatusCode(value: any): void {

		this._statusCode = value;

	}

	public getStatusCode(): number {

		return this._statusCode;

	}

	public setHeader(key: string | keyof HTTP.OutgoingHttpHeaders, value: any): void {

		// @ts-ignore
		this._headers[key] = value;

	}

	public getHeader(key: string | keyof HTTP.OutgoingHttpHeaders): any {

		// @ts-ignore
		return this._headers[key];

	}

	public setHeaders(value: object): void {

		this._headers = value;

	}

	public getHeaders(): object {

		return this._headers;

	}

}