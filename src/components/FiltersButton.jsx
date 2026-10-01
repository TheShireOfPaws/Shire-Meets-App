export default function FiltersButton({ count, onClick }) {
  return (
    <button
      type="button"
      className="filters-btn"
      onClick={onClick}
      aria-label={count > 0 ? `filters, ${count} active` : 'filters'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="10" cy="17" r="2" />
      </svg>
      filters
      {count > 0 && <span className="filters-btn__count">{count}</span>}
    </button>
  );
}
