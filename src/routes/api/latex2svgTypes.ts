import * as types from "./apiTypes";

export interface Latex2SvgRequest {
    latexStringHash: string
    timeOfRequest: string
    latexHeaderIncludes: string[]
    latexString: string
}

export interface Latex2SvgRequestApi extends Latex2SvgRequest, types.ApiRequest {}

export interface Latex2SvgResponse {
    svgData: string
    id: string
}
