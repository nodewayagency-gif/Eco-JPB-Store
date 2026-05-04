import { prisma } from '../../infrastructure/database/prisma';

export interface CouponDTO {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export class ListCouponsUseCase {
  async execute() {
    return await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}

export class CreateCouponUseCase {
  async execute(data: CouponDTO) {
    return await prisma.coupon.create({
      data: {
        ...data,
        discountValue: Number(data.discountValue),
        minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        code: data.code.toUpperCase().trim()
      }
    });
  }
}

export class UpdateCouponUseCase {
  async execute(id: string, data: Partial<CouponDTO>) {
    return await prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        discountValue: data.discountValue ? Number(data.discountValue) : undefined,
        minOrderValue: data.minOrderValue !== undefined ? (data.minOrderValue ? Number(data.minOrderValue) : null) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        code: data.code ? data.code.toUpperCase().trim() : undefined
      }
    });
  }
}

export class DeleteCouponUseCase {
  async execute(id: string) {
    return await prisma.coupon.delete({ where: { id } });
  }
}

export class ValidateCouponUseCase {
  async execute(code: string, amount: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!coupon) {
      throw new Error('Cupom não encontrado');
    }

    if (!coupon.active) {
      throw new Error('Este cupom não está mais ativo');
    }

    if (coupon.startDate && new Date() < coupon.startDate) {
      throw new Error('Este cupom ainda não começou a valer');
    }

    if (coupon.endDate && new Date() > coupon.endDate) {
      throw new Error('Este cupom já expirou');
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error('Este cupom atingiu o limite de uso');
    }

    if (coupon.minOrderValue && amount < Number(coupon.minOrderValue)) {
      throw new Error(`Valor mínimo para este cupom é ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(coupon.minOrderValue))}`);
    }

    return coupon;
  }
}
