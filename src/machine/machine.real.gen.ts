export const __tsSchema = {} as {
  initial: 'idle' | 'compound' | 'parallel';
  states: {
    idle: {
      targets: '/parallel' | '/compound';
    };
    compound: {
      initial: 'idle';
      targets: '/parallel' | '/idle';
      states: {
        idle: {
          targets: '/compound/next' | '/idle';
        };
        next: {
          targets: '/compound/idle' | '/parallel';
        };
      };
    };
    parallel: {
      targets: '/compound/next' | '/idle';
      states: {
        atomic: {
          initial: 'idle' | 'next';
          targets: '/parallel' | '/idle';
          states: {
            idle: {
              targets: '/parallel/atomic/next' | '/idle';
            };
            next: {
              targets: '/parallel/atomic/idle' | '/idle';
            };
          };
        };
        compound: {
          initial: 'idle';
          targets: '/compound/next' | '/idle';
          states: {
            idle: {
              targets: '/parallel/compound/next' | '/idle';
            };
            next: {
              targets:
                | '/parallel/compound/idle'
                | '/compound/idle'
                | '/idle';
            };
          };
        };
      };
    };
  };
  targets: '';
};
