type OrderFiltersProps = {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export default function OrderFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange
}: OrderFiltersProps) {

  //region UI
  return (
    <section className="mt-10">

      {/* Search and filters */}
      <div className="
        flex flex-col gap-4
        border border-line bg-surface
        p-4 sm:flex-row sm:items-end sm:p-5
      ">

        {/* Search */}
        <div className="min-w-0 flex-1">

          <label
            htmlFor="order-search"
            className="mb-2 block text-sm font-medium text-muted"
          >
            Search orders
          </label>

          <input
            id="order-search"
            type="search"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={event =>
              onSearchChange(event.target.value)
            }
            className="
              w-full rounded-sm
              border border-line bg-page
              px-4 py-2.5
              text-sm text-content
              placeholder:text-muted/60
              outline-none transition-colors duration-150
              hover:border-muted
              focus:border-accent
            "
          />

        </div>

        {/* Status filter */}
        <div className="w-full sm:w-52">

          <label
            htmlFor="order-status-filter"
            className="mb-2 block text-sm font-medium text-muted"
          >
            Status
          </label>

          <select
            id="order-status-filter"
            value={statusFilter}
            onChange={event =>
              onStatusChange(event.target.value)
            }
            className="
              w-full cursor-pointer rounded-sm
              border border-line bg-page
              px-4 py-2.5
              text-sm text-content
              outline-none transition-colors duration-150
              hover:border-muted
              focus:border-accent
            "
          >
            <option value="all">All statuses</option>
            <option value="planned">Planned</option>
            <option value="queued">Queued</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>

        </div>

      </div>
    </section>
  );
  //endregion
}