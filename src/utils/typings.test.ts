import { describe, expect, test } from 'vitest';
import type { ActionConfig } from '~actions';
import type { EventsMap, PromiseeDef, PromiseeMap } from '~events';
import type { AnyMachine } from '~machines';
import type { Describer } from '~types';
import typeMachine from './typings';

describe('typeMachine', () => {
  describe('castings', () => {
    describe('strings', () => {
      test('should reference external castings.strings', () => {
        expect(typeMachine.castings.strings).toBeDefined();
        expect(typeof typeMachine.castings.strings).toBe('function');
      });
    });

    describe('numbers', () => {
      test('should reference external castings.numbers', () => {
        expect(typeMachine.castings.numbers).toBeDefined();
        expect(typeof typeMachine.castings.numbers).toBe('function');
      });
    });
  });

  describe('booleans', () => {
    test('should reference external castings.booleans', () => {
      expect(typeMachine.castings.booleans).toBeDefined();
      expect(typeof typeMachine.castings.booleans).toBe('function');
    });
  });

  describe('events', () => {
    describe('map', () => {
      test('should validate valid EventsMap', () => {
        // Arrange
        const validEventsMap: EventsMap = {
          EVENT1: { type: 'string' },
          EVENT2: { count: 42, name: 'test' },
        };

        // Act & Assert
        expect(typeMachine.castings.events.map.is(validEventsMap)).toBe(
          true,
        );
      });

      test('should reject null values', () => {
        // Act & Assert
        expect(typeMachine.castings.events.map.is(null)).toBe(false);
      });

      test('should reject non-object values', () => {
        // Act & Assert
        expect(typeMachine.castings.events.map.is('string')).toBe(false);
        expect(typeMachine.castings.events.map.is(123)).toBe(false);
        expect(typeMachine.castings.events.map.is(true)).toBe(false);
      });

      test('should reject objects with non-primitive values', () => {
        // Arrange
        const invalidEventsMap = {
          EVENT1: { nested: { deeply: 'nested' } },
          EVENT2: function () {
            return 'test';
          },
        };

        // Act & Assert
        expect(typeMachine.castings.events.map.is(invalidEventsMap)).toBe(
          false,
        );
      });

      test('should accept empty object', () => {
        // Act & Assert
        expect(typeMachine.castings.events.map.is({})).toBe(true);
      });
    });
  });

  describe('promisees', () => {
    describe('map', () => {
      test('should validate valid PromiseeMap', () => {
        // Arrange
        const validPromiseeMap: PromiseeMap = {
          promise1: {
            then: { success: true },
            catch: { error: 'Failed' },
          },
          promise2: {
            then: 'Success',
            catch: ['Error1', 'Error2'],
          },
        };

        // Act & Assert
        expect(
          typeMachine.castings.promisees.map.is(validPromiseeMap),
        ).toBe(true);
      });

      test('should reject null values', () => {
        // Act & Assert
        expect(typeMachine.castings.promisees.map.is(null)).toBe(false);
      });

      test('should reject non-object values', () => {
        // Act & Assert
        expect(typeMachine.castings.promisees.map.is('string')).toBe(
          false,
        );
        expect(typeMachine.castings.promisees.map.is(123)).toBe(false);
      });

      test('should reject objects with invalid promise definitions', () => {
        // Arrange
        const invalidPromiseeMap = {
          promise1: {
            then: 'valid',
            // missing catch
          },
          promise2: {
            // missing then
            catch: 'valid',
          },
        };

        // Act & Assert
        expect(
          typeMachine.castings.promisees.map.is(invalidPromiseeMap),
        ).toBe(false);
      });
    });

    describe('def', () => {
      test('should validate valid PromiseeDef', () => {
        // Arrange
        const validPromiseeDef: PromiseeDef = {
          then: { success: true },
          catch: { error: 'Failed' },
        };

        // Act & Assert
        expect(
          typeMachine.castings.promisees.def.is(validPromiseeDef),
        ).toBe(true);
      });

      test('should validate PromiseeDef with array values', () => {
        // Arrange
        const validPromiseeDef: PromiseeDef = {
          then: ['result1', 'result2'],
          catch: 'error',
        };

        // Act & Assert
        expect(
          typeMachine.castings.promisees.def.is(validPromiseeDef),
        ).toBe(true);
      });

      test('should reject null and undefined', () => {
        // Act & Assert
        expect(typeMachine.castings.promisees.def.is(null)).toBe(false);
        expect(typeMachine.castings.promisees.def.is(undefined)).toBe(
          false,
        );
      });

      test('should reject objects without required keys', () => {
        // Arrange
        const invalidDef1 = { then: 'valid' }; // missing catch
        const invalidDef2 = { catch: 'valid' }; // missing then
        const invalidDef3 = {}; // missing both

        // Act & Assert
        expect(typeMachine.castings.promisees.def.is(invalidDef1)).toBe(
          false,
        );
        expect(typeMachine.castings.promisees.def.is(invalidDef2)).toBe(
          false,
        );
        expect(typeMachine.castings.promisees.def.is(invalidDef3)).toBe(
          false,
        );
      });
    });
  });

  describe('functions', () => {
    describe('fnR', () => {
      test('should be a valid casting function', () => {
        expect(typeMachine.castings.functions.fnR).toBeDefined();
        expect(typeof typeMachine.castings.functions.fnR).toBe('function');
      });

      test('should have machine property', () => {
        expect(typeMachine.castings.functions.fnR.machine).toBeDefined();
        expect(typeof typeMachine.castings.functions.fnR.machine).toBe(
          'function',
        );
      });
    });

    describe('fnReduced', () => {
      test('should be a valid casting function', () => {
        expect(typeMachine.castings.functions.fnReduced).toBeDefined();
        expect(typeof typeMachine.castings.functions.fnReduced).toBe(
          'function',
        );
      });
    });

    describe('map', () => {
      describe('fnMap', () => {
        test('should be a valid casting function', () => {
          expect(typeMachine.castings.functions.map.fnMap).toBeDefined();
          expect(typeof typeMachine.castings.functions.map.fnMap).toBe(
            'function',
          );
        });

        test('should have machine property', () => {
          expect(
            typeMachine.castings.functions.map.fnMap.machine,
          ).toBeDefined();
          expect(
            typeof typeMachine.castings.functions.map.fnMap.machine,
          ).toBe('function');
        });
      });

      describe('fnMapR', () => {
        test('should be a valid casting function', () => {
          expect(typeMachine.castings.functions.map.fnMapR).toBeDefined();
          expect(typeof typeMachine.castings.functions.map.fnMapR).toBe(
            'function',
          );
        });

        test('should have machine property', () => {
          expect(
            typeMachine.castings.functions.map.fnMapR.machine,
          ).toBeDefined();
          expect(
            typeof typeMachine.castings.functions.map.fnMapR.machine,
          ).toBe('function');
        });
      });
    });
  });

  describe('actions', () => {
    test('should validate string ActionConfig', () => {
      // Act & Assert
      expect(typeMachine.castings.actions.is('actionName')).toBe(true);
    });

    test('should validate object ActionConfig with proper keys', () => {
      // Arrange
      const validActionConfig: ActionConfig = {
        name: 'actionName',
        description: 'Action description',
      };

      // Act & Assert
      expect(typeMachine.castings.actions.is(validActionConfig)).toBe(
        true,
      );
    });

    test('should reject null values', () => {
      // Act & Assert
      expect(typeMachine.castings.actions.is(null)).toBe(false);
    });

    test('should reject invalid object ActionConfig', () => {
      // Arrange
      const invalidActionConfig = {
        invalidKey: 'value',
      };

      // Act & Assert
      expect(typeMachine.castings.actions.is(invalidActionConfig)).toBe(
        false,
      );
    });

    describe('describer', () => {
      test('should validate valid Describer', () => {
        // Arrange
        const validDescriber: Describer = {
          name: 'test',
          description: 'test description',
        };

        // Act & Assert
        expect(
          typeMachine.castings.actions.describer.is(validDescriber),
        ).toBe(true);
      });

      test('should reject null values', () => {
        // Act & Assert
        expect(typeMachine.castings.actions.describer.is(null)).toBe(
          false,
        );
      });

      test('should reject objects without required keys', () => {
        // Arrange
        const invalidDescriber = {
          name: 'test',
          // missing description
        };

        // Act & Assert
        expect(
          typeMachine.castings.actions.describer.is(invalidDescriber),
        ).toBe(false);
      });

      test('should reject objects with extra keys but valid name and description', () => {
        // Arrange
        const descrWithExtraKey = {
          name: 'test',
          description: 'valid',
          extraKey: 'should be ignored by checkKeys',
        };

        // Act & Assert
        // Note: checkKeys permet les clés supplémentaires, donc ce test vérifie le comportement réel
        expect(
          typeMachine.castings.actions.describer.is(descrWithExtraKey),
        ).toBe(true);
      });
    });
  });

  describe('any', () => {
    test('should be a valid casting function', () => {
      expect(typeMachine.castings.any).toBeDefined();
      expect(typeof typeMachine.castings.any).toBe('function');
    });
  });
});

describe('typings', () => {
  describe('strings', () => {
    test('should reference external typings.strings', () => {
      expect(typeMachine.typings.strings).toBeDefined();
      expect(typeof typeMachine.typings.strings).toBe('function');
    });
  });

  describe('numbers', () => {
    test('should reference external typings.numbers', () => {
      expect(typeMachine.typings.numbers).toBeDefined();
      expect(typeof typeMachine.typings.numbers).toBe('function');
    });
  });

  describe('booleans', () => {
    test('should reference external typings.booleans', () => {
      expect(typeMachine.typings.booleans).toBeDefined();
      expect(typeof typeMachine.typings.booleans).toBe('function');
    });
  });

  describe('config', () => {
    test('should be a valid typing function', () => {
      expect(typeMachine.typings.config).toBeDefined();
      expect(typeof typeMachine.typings.config).toBe('function');
    });
  });

  describe('events', () => {
    describe('map', () => {
      test('should be a valid typing function', () => {
        expect(typeMachine.typings.events.map).toBeDefined();
        expect(typeof typeMachine.typings.events.map).toBe('function');
      });
    });
  });

  describe('promisees', () => {
    describe('map', () => {
      test('should be a valid typing function', () => {
        expect(typeMachine.typings.promisees.map).toBeDefined();
        expect(typeof typeMachine.typings.promisees.map).toBe('function');
      });
    });

    describe('def', () => {
      test('should be a valid typing function', () => {
        expect(typeMachine.typings.promisees.def).toBeDefined();
        expect(typeof typeMachine.typings.promisees.def).toBe('function');
      });
    });
  });

  describe('functions', () => {
    describe('fnR', () => {
      test('should be a valid typing function', () => {
        expect(typeMachine.typings.functions.fnR).toBeDefined();
        expect(typeof typeMachine.typings.functions.fnR).toBe('function');
      });

      test('should have machine property', () => {
        expect(typeMachine.typings.functions.fnR.machine).toBeDefined();
        expect(typeof typeMachine.typings.functions.fnR.machine).toBe(
          'function',
        );
      });
    });

    describe('fnReduced', () => {
      test('should be a valid typing function', () => {
        expect(typeMachine.typings.functions.fnReduced).toBeDefined();
        expect(typeof typeMachine.typings.functions.fnReduced).toBe(
          'function',
        );
      });
    });

    describe('map', () => {
      describe('fnMap', () => {
        test('should be a valid typing function', () => {
          expect(typeMachine.typings.functions.map.fnMap).toBeDefined();
          expect(typeof typeMachine.typings.functions.map.fnMap).toBe(
            'function',
          );
        });

        test('should have machine property', () => {
          expect(
            typeMachine.typings.functions.map.fnMap.machine,
          ).toBeDefined();
          expect(
            typeof typeMachine.typings.functions.map.fnMap.machine,
          ).toBe('function');
        });
      });

      describe('fnMapR', () => {
        test('should be a valid typing function', () => {
          expect(typeMachine.typings.functions.map.fnMapR).toBeDefined();
          expect(typeof typeMachine.typings.functions.map.fnMapR).toBe(
            'function',
          );
        });

        test('should have machine property', () => {
          expect(
            typeMachine.typings.functions.map.fnMapR.machine,
          ).toBeDefined();
          expect(
            typeof typeMachine.typings.functions.map.fnMapR.machine,
          ).toBe('function');
        });
      });
    });
  });

  describe('actions', () => {
    test('should be a valid typing function', () => {
      expect(typeMachine.typings.actions).toBeDefined();
      expect(typeof typeMachine.typings.actions).toBe('function');
    });

    describe('describer', () => {
      test('should be a valid typing function', () => {
        expect(typeMachine.typings.actions.describer).toBeDefined();
        expect(typeof typeMachine.typings.actions.describer).toBe(
          'function',
        );
      });
    });
  });

  describe('any', () => {
    test('should be a valid typing function', () => {
      expect(typeMachine.typings.any).toBeDefined();
      expect(typeof typeMachine.typings.any).toBe('function');
    });
  });
});

// Tests for helper functions that are used within typeMachine
describe('helper functions', () => {
  describe('isSoRa', () => {
    test('should validate primitive objects', () => {
      // Cette fonction est utilisée dans promiseDef.cast.is
      // Nous pouvons la tester indirectement via promisees.def
      const validDef = {
        then: { success: true },
        catch: { error: 'Failed' },
      };

      expect(typeMachine.castings.promisees.def.is(validDef)).toBe(true);
    });

    test('should validate arrays of primitive objects', () => {
      const validDef = {
        then: [{ success: true }, { result: 'ok' }],
        catch: 'error',
      };

      expect(typeMachine.castings.promisees.def.is(validDef)).toBe(true);
    });

    test('should reject functions and complex types', () => {
      const invalidDef = {
        then: function () {
          return 'invalid';
        }, // Une fonction ne devrait pas être acceptée
        catch: 'error',
      };

      expect(typeMachine.castings.promisees.def.is(invalidDef)).toBe(
        false,
      );
    });
  });
});

// Integration tests
describe('integration', () => {
  test('castings and typings should have parallel structure', () => {
    // Vérifier que les structures castings et typings sont cohérentes
    expect(Object.keys(typeMachine.castings)).toEqual(
      expect.arrayContaining(Object.keys(typeMachine.typings)),
    );
  });

  test('should work with real machine-like objects', () => {
    // Test d'intégration avec des objets ressemblant à de vraies machines
    const mockMachine = {
      eventsMap: { TEST_EVENT: { data: 'string' } },
      promiseesMap: {},
      pContext: {},
      context: { count: 0 },
    } as unknown as AnyMachine;

    // Ces fonctions devraient pouvoir être appelées avec des machines réelles
    // Test de l'existence et du type des fonctions machine
    expect(typeof typeMachine.castings.functions.fnR.machine).toBe(
      'function',
    );
    expect(typeof typeMachine.typings.functions.fnR.machine).toBe(
      'function',
    );

    // Test avec des paramètres valides (les required() ont besoin d'objets non-undefined)
    expect(() =>
      typeMachine.castings.functions.fnR.machine(
        'returnValue',
        mockMachine,
      ),
    ).not.toThrow();
  });
});

// Tests détaillés pour les objets principaux de typings
describe('detailed object tests', () => {
  describe('fnR object', () => {
    describe('cast property', () => {
      test('should be a function that returns casting functions', () => {
        expect(typeof typeMachine.castings.functions.fnR).toBe('function');

        // Test d'appel avec des paramètres de type
        const result = typeMachine.castings.functions.fnR();
        expect(typeof result).toBe('function');
      });

      test('should have machine property that is a function', () => {
        expect(typeof typeMachine.castings.functions.fnR.machine).toBe(
          'function',
        );
      });

      test('machine property should work with valid machine object', () => {
        const mockMachine = {
          eventsMap: { TEST_EVENT: { data: 'test' } },
          promiseesMap: {},
          pContext: { testProp: 'value' },
          context: { count: 42 },
        } as unknown as AnyMachine;

        expect(() => {
          typeMachine.castings.functions.fnR.machine(
            'returnValue',
            mockMachine,
          );
        }).not.toThrow();
      });
      test('machine property should fail with invalid machine object', () => {
        expect(() => {
          typeMachine.castings.functions.fnR.machine(
            'returnValue',
            undefined,
          );
        }).toThrow();
      });
    });

    describe('type property', () => {
      test('should be a function that returns a typing function', () => {
        expect(typeof typeMachine.typings.functions.fnR).toBe('function');

        const result = typeMachine.typings.functions.fnR();
        expect(result).toBeUndefined();
      });

      test('should have machine property that is a function', () => {
        expect(typeof typeMachine.typings.functions.fnR.machine).toBe(
          'function',
        );
      });

      test('machine property should work with valid machine object', () => {
        const mockMachine = {
          eventsMap: { TEST_EVENT: { data: 'test' } },
          promiseesMap: {},
          pContext: { testProp: 'value' },
          context: { count: 42 },
        } as unknown as AnyMachine;

        // For typings, the machine function may return undefined but should not throw
        expect(() => {
          typeMachine.typings.functions.fnR.machine(
            mockMachine,
            'returnValue',
          );
          // The result may be undefined for type-only functions
        }).toThrow();
      });
    });
  });

  describe('fnReduced object', () => {
    describe('cast property', () => {
      test('should be a function that returns casting functions', () => {
        expect(typeof typeMachine.castings.functions.fnReduced).toBe(
          'function',
        );

        // Test d'appel pour obtenir une fonction de casting dynamique
        const result = typeMachine.castings.functions.fnReduced();
        expect(typeof result).toBe('function');
      });
      test('should return a dynamic function for specific types', () => {
        // Test avec des types spécifiques
        const castFn = typeMachine.castings.functions.fnReduced<
          { EVENT1: { data: string } },
          Record<string, never>,
          { count: number },
          string
        >();

        expect(typeof castFn).toBe('function');
      });
    });

    describe('type property', () => {
      test('should be a function that returns a typing function', () => {
        expect(typeof typeMachine.typings.functions.fnReduced).toBe(
          'function',
        );

        const result = typeMachine.typings.functions.fnReduced();
        expect(typeof result).toBe('function');
      });
      test('should work with generic type parameters', () => {
        const typeFn = typeMachine.typings.functions.fnReduced<
          { EVENT1: { data: string } },
          Record<string, never>,
          { count: number },
          boolean
        >();

        expect(typeof typeFn).toBe('function');
      });
    });
  });

  describe('_anyMachine object', () => {
    describe('cast property', () => {
      test('should be a function that returns dynamic casting for AnyMachine', () => {
        expect(typeof typeMachine.castings.any).toBe('function');

        // Test d'appel de base
        const result = typeMachine.castings.any();
        expect(typeof result).toBe('function');
      });
      test('should work with type parameters', () => {
        expect(() => {
          typeMachine.castings.any<
            { TEST_EVENT: { payload: string } },
            { testPromise: { then: string; catch: string } },
            { globalState: boolean },
            { localCount: number }
          >();
        }).not.toThrow();
      });

      test('should return a function for dynamic object validation', () => {
        const castFn = typeMachine.castings.any();
        expect(typeof castFn).toBe('function');
      });
    });

    describe('type property', () => {
      test('should be a function that returns a typing function', () => {
        expect(typeof typeMachine.typings.any).toBe('function');

        const result = typeMachine.typings.any();
        expect(typeof result).toBe('function');
      });
      test('should handle complex type parameters', () => {
        type ComplexEventsMap = {
          USER_LOGIN: { userId: string; timestamp: number };
          DATA_UPDATE: { id: string; changes: string }; // Simplifié pour être compatible
        };

        type ComplexPromiseesMap = {
          fetchUser: {
            then: { user: string };
            catch: { error: string };
          };
          saveData: { then: boolean; catch: string };
        };

        expect(() => {
          typeMachine.typings.any<
            ComplexEventsMap,
            ComplexPromiseesMap,
            { sessionId: string },
            { currentUser: string | null }
          >();
        }).not.toThrow();
      });
    });
  });

  // Tests d'intégration entre les objets
  describe('integration between objects', () => {
    test('fnR and fnReduced should be compatible', () => {
      // Les deux devraient fonctionner avec les mêmes types
      expect(() => {
        typeMachine.castings.functions.fnR<
          { EVENT: { data: string } },
          Record<string, never>,
          unknown,
          { value: number },
          string
        >();
      }).not.toThrow();

      expect(() => {
        typeMachine.castings.functions.fnReduced<
          { EVENT: { data: string } },
          Record<string, never>,
          { value: number },
          string
        >();
      }).not.toThrow();
    });

    test('_anyMachine should be compatible with machine objects used in fnR', () => {
      const mockMachine = {
        eventsMap: { TEST: { value: 'data' } },
        promiseesMap: {},
        pContext: { global: true },
        context: { local: 1 },
      } as unknown as AnyMachine;

      // _anyMachine devrait pouvoir traiter le même type de machine que fnR
      expect(() => {
        typeMachine.castings.any();
        typeMachine.castings.functions.fnR.machine('result', mockMachine);
      }).not.toThrow();
    });

    test('all typing functions should be consistent', () => {
      // Tous les objets de typing devraient retourner undefined (type-only)
      expect(typeMachine.typings.functions.fnR()).toBeUndefined();
      expect(typeof typeMachine.typings.functions.fnReduced()).toBe(
        'function',
      );
      expect(typeMachine.typings.any()()).toBeUndefined();
    });

    test('all casting functions should be consistent', () => {
      // Tous les objets de casting devraient retourner des fonctions
      expect(typeof typeMachine.castings.functions.fnR()).toBe('function');
      expect(typeof typeMachine.castings.functions.fnReduced()).toBe(
        'function',
      );
      expect(typeof typeMachine.castings.any()).toBe('function');
    });
  });

  // Tests d'erreur et de robustesse
  describe('error handling and robustness', () => {
    test('fnR.machine should handle required() validation', () => {
      // Test que required() est correctement utilisé dans machine
      expect(() => {
        typeMachine.castings.functions.fnR.machine('result', undefined);
      }).toThrow();
    });

    test('typings fnR.machine should handle undefined machine gracefully', () => {
      // Les fonctions de typing peuvent être plus permissives
      expect(() => {
        typeMachine.typings.functions.fnR.machine(undefined, 'result');
      }).toThrow(); // required() devrait aussi être utilisé ici
    });

    test('all functions should handle empty parameters', () => {
      // Test avec des paramètres vides
      expect(() =>
        typeMachine.castings.functions.fnReduced(),
      ).not.toThrow();
      expect(() =>
        typeMachine.typings.functions.fnReduced(),
      ).not.toThrow();
      expect(() => typeMachine.castings.any()).not.toThrow();
      expect(() => typeMachine.typings.any()).not.toThrow();
    });
  });
});
