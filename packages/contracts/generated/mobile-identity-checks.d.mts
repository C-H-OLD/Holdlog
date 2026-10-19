/** A generated check preserves input and exposes only schema acceptance and its last errors. */
export type ContractValidator=((value:unknown)=>boolean)&{errors?:unknown};
export interface OperationChecks {path:string;method:string;bodyRequired:boolean;parameters:{name:string;in:string;required:boolean;schema:Record<string,unknown>;style?:string;explode?:boolean;validator:ContractValidator}[];body:Record<string,{validator:ContractValidator;binary:boolean}>;responses:Record<string,Record<string,{validator:ContractValidator;binary:boolean}>>;responseHeaders:Record<string,Record<string,ContractValidator>>}
export declare const createLoginChallengeChecks: OperationChecks;
export declare const loginChecks: OperationChecks;
export declare const completeSignupChecks: OperationChecks;
export declare const refreshSessionChecks: OperationChecks;
export declare const logoutChecks: OperationChecks;
export declare const getMyProfileChecks: OperationChecks;
export declare const editMyProfileChecks: OperationChecks;
