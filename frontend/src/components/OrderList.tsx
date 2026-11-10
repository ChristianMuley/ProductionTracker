import type { ProductionOrder } from '../types/order';

type OrderListProps = {
  orders: ProductionOrder[];
  onEdit: (order: ProductionOrder) => void;
  onDispatch: (id: number, priority: boolean) => Promise<void>;
  dispatchingId: number | null;
};

const STATUS_LABELS: Record<ProductionOrder["status"], string> = {
  planned: "Planned",
  queued: "Queued",
  in_progress: "In progress",
  completed: "Completed"
};

export default function OrderList({
  orders,
  onEdit,
  onDispatch,
  dispatchingId
}: OrderListProps) {

  //region UI
  return (
    <section className="mt-8">

      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-content">
          Production orders
        </h2>

        <span className="text-sm text-muted">
          {orders.length} orders
        </span>
      </div>

      {/* Order table */}
      <div className="overflow-hidden rounded-sm border border-line bg-surface">

        {/* Column headings */}
        <div className="
          hidden border-b border-line bg-page/40
          px-5 py-3 text-xs font-medium text-muted
          sm:grid sm:grid-cols-[2fr_1.5fr_1fr_112px]
          sm:gap-4
        ">
          <span>Product</span>
          <span>Quantity / Duration</span>
          <span>Status</span>
          <span className="text-right">Dispatch</span>
        </div>

        {orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">
            No production orders found.
          </p>
        ) : (
          <ul className="divide-y divide-line">

            {orders.map(order => (
              <li
                key={order.id}
                className="
                  flex items-center gap-3 px-3 py-2
                  transition-colors duration-150
                  hover:bg-surface-hover
                  sm:px-5
                "
              >

                {/* Clickable order information */}
                <button
                  type="button"
                  onClick={() => onEdit(order)}
                  className="
                    min-w-0 flex-1 cursor-pointer
                    rounded-sm px-2 py-3 text-left
                    focus-visible:outline-2
                    focus-visible:outline-accent
                  "
                >
                  <div className="
                    grid grid-cols-1 gap-1
                    sm:grid-cols-[2fr_1.5fr_1fr]
                    sm:items-center sm:gap-4
                  ">
                    <span className="truncate text-sm font-medium text-content">
                      {order.product_name}
                    </span>

                    <span className="text-sm text-muted">
                      {order.quantity} units
                      <span className="mx-2 text-line">/</span>
                      {order.duration_seconds}s
                    </span>

                    <span className={
                      order.status === "completed"
                        ? "text-sm text-accent"
                        : "text-sm text-muted"
                    }>
                      {STATUS_LABELS[order.status]}

                      {order.is_priority && order.status !== "planned" && (
                        <span className="ml-2 text-priority">
                          (Priority)
                        </span>
                      )}
                    </span>
                  </div>
                </button>

                {/* Dispatch actions */}
                <div className="flex w-28 shrink-0 justify-end gap-2">

                  {order.status === "planned" && (
                    <>
                      <button
                        type="button"
                        title="Send to normal production (A-C)"
                        aria-label={`Send ${order.product_name} to normal production`}
                        disabled={dispatchingId === order.id}
                        onClick={() => void onDispatch(order.id, false)}
                        className="
                          h-10 w-10 cursor-pointer
                          border border-line
                          text-sm font-semibold text-accent
                          transition-colors duration-150
                          hover:border-accent hover:bg-accent/10
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >
                        &gt;
                      </button>

                      <button
                        type="button"
                        title="Send to priority production (D)"
                        aria-label={`Send ${order.product_name} to priority production`}
                        disabled={dispatchingId === order.id}
                        onClick={() => void onDispatch(order.id, true)}
                        className="
                          h-10 w-12 cursor-pointer
                          border border-line
                          text-sm font-semibold text-priority
                          transition-colors duration-150
                          hover:border-priority hover:bg-priority/10
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >
                        &gt;&gt;
                      </button>
                    </>
                  )}

                </div>
              </li>
            ))}

          </ul>
        )}

      </div>
    </section>
  );
  //endregion
}