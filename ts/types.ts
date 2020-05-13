/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {HRequest} from "./HRequest";
import {HResponse} from "./HResponse";
import {OType} from "@element-ts/oxygen";
import {HServerRequests} from "@element-ts/hydrogen-core";

export type HEndpointHandler = (param: any, req: HRequest, res: HResponse) => Promise<any>;
export type HRuntimeTypes<T extends HServerRequests<T>> = {
	[key in keyof T]: {
		[method in keyof T[key]]: OType;
	}
};