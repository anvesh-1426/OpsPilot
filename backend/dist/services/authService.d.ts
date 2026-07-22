export declare const authService: {
    login: ({ email, password }: any) => Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar: string | null;
        };
    }>;
    refresh: (refreshToken: string) => Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout: (userId: string) => Promise<void>;
    getUserProfile: (userId: string) => Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string | null;
        phone: string | null;
        isActive: boolean;
        lastLogin: Date | null;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
};
//# sourceMappingURL=authService.d.ts.map