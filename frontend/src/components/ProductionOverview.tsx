
import { useEffect, useState } from 'react';
import type { ProductionOrder } from '../types/order';

type ProductionOverviewProps = {
  orders: ProductionOrder[];
};

const LINES = ["A", "B", "C", "D"] as const;

export default function ProductionOverview({
  orders
}: ProductionOverviewProps) {

  //region Timer
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);
  //endregion

  //region Active Assignments
  const activeAssignments = orders
    .filter(order => order.status === "in_progress")
    .flatMap(order =>
      order.assignments.map(assignment => ({
        order,
        assignment
      }))
    )
    .filter(item => item.assignment.finished_at === null);
  //endregion

  //region Queues
  const normalQueued = orders.filter(order =>
    order.status === "queued" && !order.is_priority
  ).length;

  const priorityQueued = orders.filter(order =>
    order.status === "queued" && order.is_priority
  ).length;
  //endregion

  //region UI
  return (
    <section className="mt-10 mb-12">

      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-content">
            Production Overview
          </h2>
          <p className="mt-1 text-sm text-muted">
            Live assembly line activity
          </p>
        </div>
      </div>

      {/* Production lines */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {LINES.map(line => {

          const isPriority = line === "D";

          // Find the active assignment for this line
          const active = activeAssignments.find(item =>
            item.assignment.line === line
          );

          // Calculate elapsed time
          const elapsedSeconds = active
            ? Math.max(
                0,
                (now - new Date(active.assignment.started_at).getTime()) / 1000
              )
            : 0;

          const duration = active?.assignment.duration_seconds ?? 1;

          const progress = active
            ? Math.min(
                100,
                Math.floor((elapsedSeconds / duration) * 100)
              )
            : 0;

          const remainingSeconds = active
            ? Math.max(0, Math.ceil(duration - elapsedSeconds))
            : 0;

          return (
            <div
              key={line}
              className="
                rounded-lg border border-line
                bg-surface p-5 sm:p-6
                transition-all duration-200
              "
            >

              {/* Line header */}
              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">
                  <span className={`
                    flex h-10 w-10 items-center justify-center
                    rounded-md text-sm font-bold
                    ${isPriority
                      ? "bg-priority/15 text-priority"
                      : "bg-accent/15 text-accent"}
                  `}>
                    {line}
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-content">
                      Assembly Line {line}
                    </h3>

                    <p className="text-xs text-muted">
                      {isPriority ? "Priority production" : "Normal production"}
                    </p>
                  </div>
                </div>

                {/* Line status */}
                <span className={`
                  rounded-md px-2.5 py-1
                  text-xs font-medium
                  ${active
                    ? "bg-accent/10 text-accent"
                    : "bg-page text-muted"}
                `}>
                  {active ? "Processing" : "Idle"}
                </span>

              </div>

              {/* Current product */}
              <div className="mt-6 mb-5 min-h-12">
                {active ? (
                  <>
                    <p className="truncate text-sm font-medium text-content">
                      {active.order.product_name}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      {active.assignment.units} units assigned
                      {" · "}
                      Order #{active.order.id}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    {isPriority
                      ? "Waiting for priority orders"
                      : "Available for production"}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-page"
                role="progressbar"
                aria-label={`Assembly Line ${line} progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className={`
                    h-full rounded-full
                    transition-[width] duration-700 ease-linear
                    ${isPriority ? "bg-priority" : "bg-accent"}
                  `}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Progress details */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs font-medium tabular-nums text-content">
                  {progress}%
                </span>

                <span className="text-xs tabular-nums text-muted">
                  {active
                    ? `${remainingSeconds}s remaining`
                    : "No active order"}
                </span>
              </div>

            </div>
          );
        })}

      </div>

      {/* Waiting queues */}
      <div className="
        mt-4 flex flex-wrap items-center gap-x-8 gap-y-3
        rounded-lg border border-line bg-surface
        px-5 py-4
      ">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            Normal queue
          </span>
          <span className="text-sm font-semibold tabular-nums text-content">
            {normalQueued}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            Priority queue
          </span>
          <span className="text-sm font-semibold tabular-nums text-priority">
            {priorityQueued}
          </span>
        </div>
      </div>

    </section>
  );
  //endregion
}
