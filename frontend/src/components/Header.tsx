type HeaderProps = {
  authenticated: boolean;
  username: string | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export default function Header({
  authenticated,
  username,
  onOpenLogin,
  onLogout,
  isLoggingOut
}: HeaderProps) {

  return (
    <header className="
      mb-10
      flex flex-wrap items-center justify-between
      gap-4
      border-b border-line
      pb-6
    ">

      {/* Application title */}
      <div>
        <h1 className="
          text-2xl font-semibold tracking-tight
          text-content sm:text-3xl
        ">
          ProductionTracker
        </h1>

        <p className="mt-1 text-sm text-muted">
          Production management
        </p>
      </div>

      {/* Authentication controls */}
      <div className="flex items-center gap-4">

        {authenticated ? (
          <>
            <span className="text-sm text-muted">
              {username}
            </span>

            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="
                rounded-md
                border border-line
                bg-surface
                px-4 py-2
                text-sm font-medium text-content
                transition-colors duration-200
                hover:border-accent
                hover:bg-surface-hover
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-accent
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="
              rounded-md
              bg-accent
              px-5 py-2.5
              text-sm font-semibold text-page
              transition-colors duration-200
              hover:bg-accent-hover
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-accent
            "
          >
            Log in
          </button>
        )}

      </div>
    </header>
  );
}