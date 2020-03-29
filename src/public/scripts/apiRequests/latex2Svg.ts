import type * as api from "../../../routes/api";
import * as general from "./general";


export const latex2Svg = async (
    input: api.latex2svg.types.Latex2SvgRequest
): Promise<api.latex2svg.types.Latex2SvgResponse> => {
    return general.generalApiRequest<api.latex2svg.types.Latex2SvgRequest, api.latex2svg.types.Latex2SvgResponse>(
        "/api/latex2svg", input
    );
};
