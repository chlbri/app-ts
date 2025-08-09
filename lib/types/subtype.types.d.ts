type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type NotFilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? never : Key;
};
export type AllowedNames<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];
export type NotAllowedNames<Base, Condition> = NotFilterFlags<
  Base,
  Condition
>[keyof Base];
export type SubType<Base extends object, Condition> = Pick<
  Base,
  AllowedNames<Base, Condition>
>;
export type NotSubType<Base extends object, Condition> = Pick<
  Base,
  NotAllowedNames<Base, Condition>
>;
export {};
//# sourceMappingURL=subtype.types.d.ts.map
