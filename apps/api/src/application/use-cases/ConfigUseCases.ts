import { prisma } from '../../infrastructure/database/prisma';

export interface CompanyConfigInput {
  companyName: string;
  tradeName?: string;
  document: string;
  email: string;
  phone: string;
  originZipCode: string;
  addressLine: string;
  city: string;
  state: string;
  instagramUrl?: string;
}

export class GetCompanyConfigUseCase {
  async execute() {
    const config = await prisma.companyConfig.findFirst();
    if (!config) {
      // Retorna valores padrão se não existir no banco
      return {
        companyName: "JPB Store LTDA",
        tradeName: "JPB Store",
        document: "00.000.000/0001-00",
        email: "financeiro@jpb.com",
        phone: "(11) 4002-8922",
        originZipCode: "01001-000",
        addressLine: "Rua Aurora, 450",
        city: "São Paulo",
        state: "SP",
        instagramUrl: "https://instagram.com/jpbstore"
      };
    }
    return config;
  }
}

export class UpdateCompanyConfigUseCase {
  async execute(data: CompanyConfigInput) {
    const config = await prisma.companyConfig.findFirst();
    
    if (config) {
      return await prisma.companyConfig.update({
        where: { id: config.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } else {
      return await prisma.companyConfig.create({
        data
      });
    }
  }
}
