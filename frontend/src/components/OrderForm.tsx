import { useRef, useState, type FormEvent } from 'react';
import type { CreateProductionOrder } from '../types/order';

type OrderFormProps = {
  onCreate: (order: CreateProductionOrder) => Promise<void>;
};

export default function OrderForm({ onCreate }: OrderFormProps) {

  //region State
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState(60);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //endregion

  //region Modal
  function openModal() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function closeModal() {
    if (isSubmitting) return;
    dialogRef.current?.close();
  }
  //endregion

  //region Create Order
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await onCreate({
        product_name: productName.trim(),
        quantity,
        duration_seconds: durationSeconds
      });

      setProductName("");
      setQuantity(1);
      setDurationSeconds(60);

      dialogRef.current?.close();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create order."
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  //endregion

  //region UI
  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="
          cursor-pointer rounded-sm
          bg-accent px-5 py-2.5
          text-sm font-semibold text-page
          transition-colors duration-150
          hover:bg-accent-hover
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-accent
        "
      >
        + Create Order
      </button>

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
        onCancel={event => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <h2 className="mb-6 text-lg font-semibold">
          Create production order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Product name */}
          <div>
            <label
              htmlFor="create-product"
              className="mb-2 block text-sm text-muted"
            >
              Product name
            </label>
            <input
              id="create-product"
              type="text"
              maxLength={120}
              required
              value={productName}
              onChange={event => setProductName(event.target.value)}
              className="
                w-full rounded-sm border border-line
                bg-page px-3 py-2.5
                text-sm text-content
                outline-none transition-colors
                focus:border-accent
              "
            />
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="create-quantity"
              className="mb-2 block text-sm text-muted"
            >
              Quantity
            </label>
            <input
              id="create-quantity"
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={event => setQuantity(Number(event.target.value))}
              className="
                w-full rounded-sm border border-line
                bg-page px-3 py-2.5
                text-sm text-content
                outline-none transition-colors
                focus:border-accent
              "
            />
          </div>

          {/* Production duration */}
          <div>
            <label
              htmlFor="create-duration"
              className="mb-2 block text-sm text-muted"
            >
              Production duration (seconds)
            </label>
            <input
              id="create-duration"
              type="number"
              min="1"
              step="1"
              required
              value={durationSeconds}
              onChange={event =>
                setDurationSeconds(Number(event.target.value))
              }
              className="
                w-full rounded-sm border border-line
                bg-page px-3 py-2.5
                text-sm text-content
                outline-none transition-colors
                focus:border-accent
              "
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="
                cursor-pointer rounded-sm border border-line
                px-4 py-2 text-sm text-content
                transition-colors hover:bg-surface-hover
                disabled:cursor-not-allowed disabled:opacity-50
              "
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
              {isSubmitting ? "Creating..." : "Create Order"}
            </button>
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        </form>
      </dialog>
    </>
  );
  //endregion
}