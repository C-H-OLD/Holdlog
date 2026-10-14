/** A generated check preserves input and exposes only schema acceptance and its last errors. */
export type ContractValidator=((value:unknown)=>boolean)&{errors?:unknown};
export interface OperationChecks {path:string;method:string;bodyRequired:boolean;parameters:{name:string;in:string;required:boolean;schema:Record<string,unknown>;style?:string;explode?:boolean;validator:ContractValidator}[];body:Record<string,{validator:ContractValidator;binary:boolean}>;responses:Record<string,Record<string,{validator:ContractValidator;binary:boolean}>>;responseHeaders:Record<string,Record<string,ContractValidator>>}
export declare const adminLoginChecks: OperationChecks;
export declare const adminSessionChecks: OperationChecks;
export declare const adminLogoutChecks: OperationChecks;
