import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ProductionOrder, CreateProductionOrder } from '../types/order';

type EditOrderModalProps = {
  order: ProductionOrder;
  onSave: (
    id: number,
    changes: Partial<CreateProductionOrder>
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClose: () => void;
};

const inputClass = `
  w-full rounded-sm border border-line
  bg-page px-3 py-2.5 text-sm text-content
  outline-none transition-colors focus:border-accent
`;

const secondaryButtonClass = `
  cursor-pointer rounded-sm border border-line
  px-4 py-2 text-sm text-content
  transition-colors hover:bg-surface-hover
  disabled:cursor-not-allowed disabled:opacity-50
`;

export default function EditOrderModal({
  order,
  onSave,
  onDelete,
  onClose
}: EditOrderModalProps) {

  //region Modal
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  function closeModal() {
    if (isSubmitting) return;

    dialogRef.current?.close();
    onClose();
  }
  //endregion

  //region State
  const [productName, setProductName] = useState(order.product_name);
  const [quantity, setQuantity] = useState(order.quantity);
  const [durationSeconds, setDurationSeconds] =
    useState(order.duration_seconds);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //endregion

  //region Update
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(order.id, {
        product_name: productName.trim(),
        quantity,
        duration_seconds: durationSeconds
      });

      dialogRef.current?.close();
      onClose();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update order."
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  //endregion

  //region Delete
  async function handleDelete() {
    setError(null);
    setIsSubmitting(true);

    try {
      await onDelete(order.id);

      dialogRef.current?.close();
      onClose();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete order."
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  //endregion

  //region UI
  return (
    <dialog
      ref={dialogRef}
      className="
        m-auto w-[min(440px,calc(100vw-32px))]
        max-h-[90vh] overflow-y-auto
        rounded-sm border border-line
        bg-surface p-6 text-content
        shadow-2xl backdrop:bg-page/80
        sm:p-7
      "
      aria-labelledby="edit-order-title"
      onCancel={event => {
        event.preventDefault();
        closeModal();
      }}
    >
      <h2
        id="edit-order-title"
        className="mb-6 text-lg font-semibold"
      >
        {confirmDelete
          ? "Delete production order"
          : `Edit production order #${order.id}`}
      </h2>

      {confirmDelete ? (
        <div className="space-y-5">

          <p className="text-sm leading-relaxed text-content">
            Are you sure you want to delete{" "}
            <strong>{order.product_name}</strong>?
          </p>

          <p className="text-sm text-danger">
            This action cannot be undone.
          </p>

          <div className="
            flex flex-wrap justify-end gap-3
            border-t border-line pt-5
          ">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setError(null);
                setConfirmDelete(false);
              }}
              className={secondaryButtonClass}
            >
              Go Back
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleDelete()}
              className="
                cursor-pointer rounded-sm bg-danger
                px-4 py-2 text-sm font-semibold text-page
                transition-opacity hover:opacity-85
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {isSubmitting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Product name */}
          <div>
            <label
              htmlFor="edit-product"
              className="mb-2 block text-sm text-muted"
            >
              Product name
            </label>
            <input
              id="edit-product"
              type="text"
              maxLength={120}
              required
              value={productName}
              onChange={event => setProductName(event.target.value)}
              className={inputClass}
            />
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="edit-quantity"
              className="mb-2 block text-sm text-muted"
            >
              Quantity
            </label>
            <input
              id="edit-quantity"
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={event => setQuantity(Number(event.target.value))}
              className={inputClass}
            />
          </div>

          {/* Production duration */}
          <div>
            <label
              htmlFor="edit-duration"
              className="mb-2 block text-sm text-muted"
            >
              Production duration (seconds)
            </label>
            <input
              id="edit-duration"
              type="number"
              min="1"
              step="1"
              required
              value={durationSeconds}
              onChange={event =>
                setDurationSeconds(Number(event.target.value))
              }
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="
            flex flex-wrap justify-end gap-3
            border-t border-line pt-5
          ">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setError(null);
                setConfirmDelete(true);
              }}
              className="
                mr-auto cursor-pointer rounded-sm
                border border-danger/50
                px-4 py-2 text-sm text-danger
                transition-colors hover:bg-danger/10
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              Delete
            </button>

            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className={secondaryButtonClass}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                cursor-pointer rounded-sm bg-accent
                px-4 py-2 text-sm font-semibold text-page
                transition-colors hover:bg-accent-hover
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        </form>
      )}
    </dialog>
  );
  //endregion
}