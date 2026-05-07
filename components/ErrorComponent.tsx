"use client";

const ErrorComponent = ({ error, onRetry }: any) => {
  return (
    <div className="bgprimary txtprimary flex flex-col items-center justify-center border-0 overflow-y-auto"
      style={{ height: 'calc(100vh - var(--navbar-h) - 2px)' }}>
      <div className="card-error-container bgsecondaryborder txtsecondary">
        <div className="error-content">
          <div className="error-icon"><img src="/warning.webp" alt="" /></div>
          <h3 className="error-title txterror">Something has gone wrong !</h3>
          <p className="error-message txtprimary">
            {error || "An unexpected error occurred. Please try again later."}
          </p>
          <button className="basebutton appwhitebutton mt-4" onClick={onRetry}>
            Retry
          </button>
        </div>


        <style jsx>{`
          .card-error-container {
            margin: 0;
            width: 300px;
            min-height: 300px;
            max-height: 500px;
            overflow-y: auto; 
            border-radius: 16px;
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            // box-shadow: 0 4px 10px rgba(59, 48, 42, 0.5);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          .error-content {
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .error-icon {
            font-size: 2.5rem;
            margin-bottom: 5px;
          }

          .error-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1;
          }

          .error-message {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1;
            opacity: 0.9;
            display: -webkit-box;
            -webkit-line-clamp: 8;
            line-clamp: 8;
            -webkit-box-orient: vertical;
            overflow: hidden;
            overflow-wrap: break-word;
            word-break: break-all;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ErrorComponent;
