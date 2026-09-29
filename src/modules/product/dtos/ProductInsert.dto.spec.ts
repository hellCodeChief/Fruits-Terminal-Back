import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ProductInsertDTO } from './ProductInsert.dto';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  stopAtFirstError: true,
});

function transform(body: object) {
  return pipe.transform(body, {
    type: 'body',
    metatype: ProductInsertDTO,
  });
}

describe('ProductInsertDTO', () => {
  it('requires name and price and allows a missing description', async () => {
    const dto = await transform({ name: 'رژ لب', price: '250000' });
    expect(dto).toMatchObject({ name: 'رژ لب', price: 250000 });
    expect(dto.description).toBeUndefined();
    expect(dto.categoryIds).toBeUndefined();
    expect(dto.slug).toBeUndefined();
  });

  it('keeps optional description and existing extra fields', async () => {
    const dto = await transform({
      name: 'رژ لب',
      price: 10,
      description: 'مات',
      slug: 'lip',
      categoryIds: '[1,2]',
      isActive: 'false',
    });
    expect(dto).toMatchObject({
      description: 'مات',
      slug: 'lip',
      categoryIds: [1, 2],
      isActive: false,
    });
  });

  it('rejects a product without a name or price', async () => {
    await expect(transform({ price: 10 })).rejects.toBeInstanceOf(BadRequestException);
    await expect(transform({ name: 'رژ لب' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(transform({ name: 'رژ لب', price: -1 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
