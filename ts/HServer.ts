/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {
	HEndpointParam,
	HEndpointReturn,
	HMethod,
	HServerRequests,
	HErrorStatus,
	HError
} from "@element-ts/hydrogen-core";
import {HRequest} from "./HRequest";
import {Neon} from "@element-ts/neon";
import * as HTTP from "http";
import * as HTTPS from "https";
import * as FS from "fs";
import * as Path from "path";
import {HEndpointMap} from "./HEndpointMap";
import {HResponse} from "./HResponse";
import {HResponseManager} from "./HResponseManager";
import {HEndpoint, HEndpointConfig} from "./HEndpoint";
import {HRequestParser} from "./HRequestParser";
import {OType} from "@element-ts/oxygen";
import {HRuntimeTypes} from "./types";

export interface HServerConfig<T extends HServerRequests<T>> {
	debug?: boolean;
	port: number;
	secure?: {
		key: string;
		cert: string;
	};
	types?: HRuntimeTypes<T>;
}

export class HServer<T extends HServerRequests<T>> {

	private readonly config: HServerConfig<T>;
	private server: HTTP.Server;
	private endpoints: HEndpointMap;
	public static logger: Neon = new Neon();

	private constructor(config: HServerConfig<T>, completionHandler: () => void) {

		this.config = config;
		this.incomingMessageHandler = this.incomingMessageHandler.bind(this);
		this.endpoints = new HEndpointMap();

		if (config.debug === true) {
			HServer.logger.enable();
			HServer.logger.setTitle("@element-ts/hydrogen-server");
		}

		HServer.logger.log("Initializing new hydrogen server.");

		if (config.secure === undefined) {

			HServer.logger.log("Starting HTTP server.");
			this.server = HTTP.createServer(this.incomingMessageHandler);

		} else {

			HServer.logger.log("Starting HTTPS server.");

			const keyPath = Path.resolve(config.secure.key);
			const certPath = Path.resolve(config.secure.cert);

			HServer.logger.log("Looking for HTTPS key and certificate.");

			if (!FS.existsSync(keyPath)) throw new Error("A key does not exist at the path provided.");
			if (!FS.existsSync(certPath)) throw new Error("A cert does not exist at the path provided.");

			HServer.logger.log("Found HTTPS key and certificate.");

			const key = FS.readFileSync(keyPath);
			const cert = FS.readFileSync(certPath);

			HServer.logger.log("Done reading HTTPS key and certificate.");

			this.server = HTTPS.createServer({key, cert}, this.incomingMessageHandler);

		}

		this.server.listen(config.port, completionHandler);

	}

	private getTypeForRequest(request: HRequest): OType | undefined {

		if (this.config.types === undefined) return;
		const url = request.endpoint() as keyof T;
		const urlTypes = this.config.types[url];
		if (urlTypes === undefined) return;

		return urlTypes[request.method()];

	}


	private incomingMessageHandler(req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void {
		(async () => {

			const request = new HRequest(req);
			HServer.logger.log(`${request.id()}: Generated new ${request.toString()} instance.`);
			const responseConfig = new HResponse(request, res);
			HServer.logger.log(`${request.id()}: Generated new HResponse instance.`);
			const response = new HResponseManager(request, responseConfig, res);
			HServer.logger.log(`${request.id()}: Generated new HResponseManager instance.`);
			const endpoint = this.endpoints.get(request.url(), request.method());
			request.setEndpoint(endpoint?.endpoint());
			if (endpoint === undefined) {
				HServer.logger.log(`${request.id()}: Could not locate endpoint for request for: ${request.method()} ${request.url()}'.`);
				return await response.sendError(new HError(HErrorStatus.NotFound, "Endpoint does not exist."));
			} else {
				HServer.logger.log(`${request.id()}: Located endpoint for request.`);
			}

			let responseValue: any;

			try {

				HServer.logger.log(`${request.id()}: Will parse request.`);
				await HRequestParser.parse(request);
				HServer.logger.log(`${request.id()}: Did parse request.`);
				HServer.logger.log(`${request.id()}: Will look for runtime type check.`);
				const type = this.getTypeForRequest(request);

				const param = request.param();

				if (type) {
					HServer.logger.log(`${request.id()}: Found runtime type check request.`);
					if (!type.conforms(param)) {
						HServer.logger.log(`${request.id()}: Request body did not conform to type.`);
						throw new HError(HErrorStatus.NotAcceptable, "Incorrect type for parameter.");
					}
					HServer.logger.log(`${request.id()}: Request body did confirm to type.`);
				} else {
					HServer.logger.log(`${request.id()}: Could not fine runtime type check request.`);
				}

				HServer.logger.log(`${request.id()}: Will pass control to endpoint handler, waiting to catch errors.`);
				responseValue = await endpoint.handler()(param, request, responseConfig);
				HServer.logger.log(`${request.id()}: Did receive control from endpoint handler successfully.`);
				await response.sendResponse(responseValue);

			} catch (e) {

				let error: any = e;
				if (!(error instanceof HError)) error = new HError(HErrorStatus.InternalServerError, "An internal server error occurred.");
				await response.sendError(error);

			}

			await response.sendResponse(responseValue);

		})().catch(err => HServer.handleMainLoopError(err, req, res));
	}

	public implement<E extends keyof T & string, M extends keyof T[E] & HMethod>
	(endpoint: E, method: M, handler: (param: HEndpointParam<T, E, M>, req: HRequest, res: HResponse) => Promise<HEndpointReturn<T, E, M>>, config?: HEndpointConfig): void {

		this.endpoints.set(endpoint, method, new HEndpoint(endpoint, handler, config));

	}

	private static handleMainLoopError(error: any, req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void {
		//TODO handle main loop error...
		HServer.logger.err(error);
	}

	public static init<T extends HServerRequests<T>>(config: HServerConfig<T>): Promise<HServer<T>> {
		return new Promise<HServer<T>>(resolve => {
			const server = new HServer<T>(config, () => {
				HServer.logger.log("Server live and listening on port: " + config.port + ".");
				resolve(server);
			});
		});
	}

}