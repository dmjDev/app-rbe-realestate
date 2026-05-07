"use client"

export default function NotFound() {
  return (
    <div className="bgprimary txtprimary flex flex-col items-center justify-center border-0 overflow-y-auto"
      style={{ height: 'calc(100vh - var(--navbar-h) - 2px)' }}>
      <div className="card-container">
        <div className="content-col">
          <div className='content-row'>
            <div className="text txtsecondaryfaded">404</div>
            <div className='flex h-14 ml-5 pl-5 border-l-2 border-zinc-700 text-nowrap items-center'>Page not found</div>
          </div>
          <div className="text-center mb-8 space-y-2">
            <p className="text-sm text-zinc-500">
              Please try again later. If the problem persists, <br />
              please contact the administrator.
            </p>
            <p className="text-xs italic text-zinc-600">
              Sorry for the inconvenience.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card-container {
          width: 300px;
          height: 300px;
          background-color: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .content-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .content-row {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .text {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 5.5rem;
          font-weight: 500;
          letter-spacing: 1px;
          /* Animación sutil de parpadeo para el texto */
          animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}