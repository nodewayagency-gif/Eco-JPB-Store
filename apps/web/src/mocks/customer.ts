import type { CustomerOrderView, CustomerProfile } from "@premium/contracts";

export const mockCustomerProfiles: CustomerProfile[] = [
  {
    id: "cst_profile_001",
    userId: "usr_customer_001",
    name: "Carlos Silva",
    phone: "+55 11 99999-1234",
    defaultAddress: "Rua Aurora, 450 - São Paulo"
  }
];

export const mockOrdersByUser: Record<string, CustomerOrderView[]> = {
  usr_customer_001: [
    {
      id: "#JPB-1042",
      product: "JPB Studio Pro",
      total: 1899.9,
      date: "08/03/2026",
      status: "Em Trânsito",
      tracking: [
        { title: "Pedido Confirmado", description: "Pagamento aprovado", date: "08/03 - 10:24", completed: true },
        { title: "Em Preparação", description: "Produto embalado no centro de distribuição", date: "09/03 - 14:05", completed: true },
        { title: "Em Trânsito", description: "Saiu para entrega - Transportadora JPB Express", date: "11/03 - 08:30", completed: true, active: true },
        { title: "Entrega Prevista", description: "Previsão: 14/03/2026", date: "14/03", completed: false }
      ]
    },
    {
      id: "#JPB-1035",
      product: "JPB Air Elite",
      total: 999.9,
      date: "22/02/2026",
      status: "Entregue",
      tracking: [
        { title: "Pedido Confirmado", description: "Pagamento aprovado", date: "22/02 - 09:12", completed: true },
        { title: "Em Preparação", description: "Produto embalado", date: "23/02 - 11:40", completed: true },
        { title: "Em Trânsito", description: "Transportadora JPB Express", date: "24/02 - 07:15", completed: true },
        { title: "Entregue", description: "Recebido por Carlos S.", date: "26/02 - 15:33", completed: true }
      ]
    }
  ]
};
