export declare const config: {
    nodeEnv: "development" | "production" | "test";
    isDev: boolean;
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    cors: {
        origins: string[];
    };
    bcrypt: {
        rounds: number;
    };
    log: {
        level: string;
    };
};
//# sourceMappingURL=index.d.ts.map