import { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
    export interface ProtocolMap {
        "DIFFICULTY_CHANGED": ProtocolWithReturn<{ difficulty: number }, boolean>;
    }
}
