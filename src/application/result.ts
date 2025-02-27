export type Result = {
    statusCode: number;
    headers?: {
        [header: string]: string;
    };
    body: string;
};
