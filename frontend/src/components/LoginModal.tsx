import { useEffect, useRef, useState, type FormEvent } from 'react';
import { loginUser, type AuthSession } from '../api/auth';

type LoginModalProps = {
  onSuccess: (session: AuthSession) => void;
  onClose: () => void;
};

export default function LoginModal({
  onSuccess,
  onClose
}: LoginModalProps) {

  //region State
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //endregion

  //region Modal
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

  //region Login
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const session = await loginUser(username.trim(), password);

      setPassword("");
      dialogRef.current?.close();
      onSuccess(session);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to log in."
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
      aria-labelledby="login-title"
      onCancel={event => {
        event.preventDefault();
        closeModal();
      }}
    >
      <h2 id="login-title" className="mb-6 text-lg font-semibold">
        Log in to ProductionTracker
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Username */}
        <div>
          <label
            htmlFor="login-username"
            className="mb-2 block text-sm text-muted"
          >
            Username
          </label>

          <input
            id="login-username"
            type="text"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={event => setUsername(event.target.value)}
            className="
              w-full rounded-sm border border-line
              bg-page px-3 py-2.5 text-sm text-content
              outline-none transition-colors focus:border-accent
            "
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block text-sm text-muted"
          >
            Password
          </label>

          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="
              w-full rounded-sm border border-line
              bg-page px-3 py-2.5 text-sm text-content
              outline-none transition-colors focus:border-accent
            "
          />
        </div>

        {/* Actions */}
        <div className="
          flex justify-end gap-3
          border-t border-line pt-5
        ">
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
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </div>

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </form>
    </dialog>
  );
  //endregion
}