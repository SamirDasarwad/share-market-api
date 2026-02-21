import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import Decimal from 'decimal.js';

export function WeightsSumToOne(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'WeightsSumToOne',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) {
            return false;
          }
          try {
            const sum = value.reduce((acc: Decimal, item: { weight: number }) => {
              if (typeof item?.weight !== 'number') {
                return acc;
              }
              return acc.plus(new Decimal(item.weight));
            }, new Decimal(0));
            return sum.minus(1).abs().lte(new Decimal('0.000001'));
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} weights must sum to 1.0`;
        },
      },
    });
  };
}
