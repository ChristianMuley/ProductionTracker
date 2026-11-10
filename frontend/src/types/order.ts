
export type ProductionAssignment = {
  id: number;
  line: "A" | "B" | "C" | "D";
  units: number;
  duration_seconds: number;
  started_at: string;
  finished_at: string | null;
};

export type ProductionOrder = {
  id: number;
  product_name: string;
  quantity: number;

  status: "planned" | "queued" | "in_progress" | "completed";

  duration_seconds: number;
  is_priority: boolean;

  // Legacy fields, temporarily retained
  assigned_line: "A" | "B" | "C" | "D" | null;
  started_at: string | null;

  created_at: string;

  // New production assignments
  assignments: ProductionAssignment[];
};

export type CreateProductionOrder = {
  product_name: string;
  quantity: number;
  duration_seconds: number;
  status?: string;
};
