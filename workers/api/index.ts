import { handleKshtApi, type KshtEnv } from "../../server/http/ksht.ts";

export default {
  async fetch(request: Request, env: KshtEnv): Promise<Response> {
    return handleKshtApi(request, env);
  },
};
