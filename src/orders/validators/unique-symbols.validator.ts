import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function UniqueSymbols(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'UniqueSymbols',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) {
            return false;
          }
          const symbols = value
            .map((item: { symbol?: string }) => item?.symbol)
            .filter((symbol) => typeof symbol === 'string');
          return symbols.length === new Set(symbols).size;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} symbols must be unique`;
        },
      },
    });
  };
}
