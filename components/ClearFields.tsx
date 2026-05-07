const ClearFields = ({clearForm, isLoading} : {clearForm: () => void, isLoading: boolean}) => {
  return (
    <div className="relative flex flex-col items-center group w-4">
      <button
        type="button"
        onClick={clearForm}
        disabled={isLoading}
        className="transition-transform duration-500 ease-in-out transform hover:scale-125 active:scale-95 focus:outline-none"
      >
        <svg
          className="h-5 w-5 txtaccent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      {/* Tooltip (Aparece en hover gracias a Tailwind 'group-hover') */}
      <span className="txtprimary absolute top-full mt-2 p-2 ml-20 scale-0 transition-all flex-nowrap text-nowrap text-xs group-hover:scale-100">
        Clear Form
      </span>
    </div>
  )
}

export default ClearFields