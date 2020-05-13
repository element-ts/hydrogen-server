/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {HEndpointHandler} from "./types";

export interface HEndpointConfig {

}

export class HEndpoint {

	private readonly _handler: HEndpointHandler;
	private readonly _config: HEndpointConfig | undefined;
	private readonly _endpoint: string;

	public constructor(endpoint: string, handler: HEndpointHandler, config?: HEndpointConfig) {

		this._handler = handler;
		this._config = config;
		this._endpoint = endpoint;

	}

	public handler(): HEndpointHandler {

		return this._handler;

	}

	public config(): HEndpointConfig | undefined {

		return this._config;

	}

	public endpoint(): string {
		return this._endpoint;
	}

}