/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */
import {HRequest} from "./HRequest";
import {HError, HErrorStatus} from "@element-ts/hydrogen-core";

export abstract class HRequestParser {

	public static parse(request: HRequest): Promise<void> {
		return new Promise<void>((resolve, reject) => {

			const req = request.rawRequest();
			console.log("a");
			let payload: Buffer = Buffer.alloc(0, 0);
			console.log("b");
			req.on("data", (chunk: Buffer): void => {
				console.log("c");
				payload = Buffer.concat([payload, chunk]);
				if (payload.length > 10_000_000) throw new HError(HErrorStatus.NotAcceptable, "Body limited to 10MB.");

			});

			console.log("d");

			req.on("error", reject);
			req.on("end", (): void => {

				console.log("e");
				request.setPayload(payload);

				resolve();

			});

		});
	}


}