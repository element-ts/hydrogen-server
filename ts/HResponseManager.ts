/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {HRequest} from "./HRequest";
import {HResponse} from "./HResponse";
import * as HTTP from "http";
import {HError} from "@element-ts/hydrogen-core";
import {HServer} from "./HServer";

export class HResponseManager {

	private readonly _request: HRequest;
	private readonly _response: HTTP.ServerResponse;
	private readonly _responseConfig: HResponse;

	public constructor(request: HRequest, responseConfig: HResponse, response: HTTP.ServerResponse) {

		this._request = request;
		this._responseConfig = responseConfig;
		this._response = response;

	}

	private send(value: object): void {

		const valueString = JSON.stringify(value) + "\n";
		HServer.logger.log(`${this._request.id()}: Did stringify response.`);
		const valueData = Buffer.from(valueString, "utf8");
		HServer.logger.log(`${this._request.id()}: Did create buffer for response: ${valueData.length} bytes.`);

		HServer.logger.log(`${this._request.id()}: Setting internal headers.`);
		this._responseConfig.setHeader("X-Powered-By", "@element-ts/hydrogen-server");
		this._responseConfig.setHeader("content-length", valueData.length);
		this._responseConfig.setHeader("content-type", "application/json");

		HServer.logger.log(`${this._request.id()}: Will write head to response.`);
		this._response.writeHead(
			this._responseConfig.getStatusCode(),
			this._responseConfig.getHeaders() as HTTP.OutgoingHttpHeaders
		);
		HServer.logger.log(`${this._request.id()}: Did write head to response.`);
		HServer.logger.log(`${this._request.id()}: Will write response data.`);
		this._response.end(valueData);
		HServer.logger.log(`${this._request.id()}: Did close response.`);

	}

	public async sendError(error: HError): Promise<void> {

		HServer.logger.log(`${this._request.id()}: Will send error to client: ${error.status()} - ${error.msg()}.`);
		this._responseConfig.setStatusCode(error.status());
		this.send({error: error.msg()});

	}

	public async sendResponse(value: any): Promise<void> {

		HServer.logger.log(`${this._request.id()}: Will send response to user.`);
		this.send({value});

	}

}