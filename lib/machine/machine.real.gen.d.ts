export declare const __tsSchema: {
    readonly initial: readonly [];
    readonly states: {
        readonly idle: {
            readonly targets: readonly ["/parallel", "/compound"];
        };
        readonly compound: {
            readonly initial: readonly ["idle"];
            readonly targets: readonly ["/parallel", "/idle"];
            readonly states: {
                readonly idle: {
                    readonly targets: readonly ["/compound/next", "/idle"];
                };
                readonly next: {
                    readonly targets: readonly ["/compound/idle", "/parallel"];
                };
            };
        };
        readonly parallel: {
            readonly targets: readonly ["/compound/next", "/idle"];
            readonly states: {
                readonly atomic: {
                    readonly initial: readonly ["idle", "next"];
                    readonly targets: readonly ["/parallel", "/idle"];
                    readonly states: {
                        readonly idle: {
                            readonly targets: readonly ["/parallel/atomic/next", "/idle"];
                        };
                        readonly next: {
                            readonly targets: readonly ["/parallel/atomic/idle", "/idle"];
                        };
                    };
                };
                readonly compound: {
                    readonly initial: readonly ["idle"];
                    readonly targets: readonly ["/compound/next", "/idle"];
                    readonly states: {
                        readonly idle: {
                            readonly targets: readonly ["/parallel/compound/next", "/idle"];
                        };
                        readonly next: {
                            readonly targets: readonly ["/parallel/compound/idle", "/compound/idle", "/idle"];
                        };
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=machine.real.gen.d.ts.map