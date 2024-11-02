const LoadingSpinner = () => {
    return (
        <>
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p className="loading-text">
                    Please wait for admin approval...
                </p>
            </div>
            <style>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .loading-text {
          color: white;
          font-size: 16px;
          text-align: center;
        }
      `}</style>
        </>
    )
}
const InlineLoadingSpinner = () => {
    return (
        <>
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Please wait</p>
            </div>
            <style>{`
              .loading-container {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  height: 50px; /* Set the desired height */
                  margin: 20px 0; /* Add margin for spacing */
              }
              .spinner {
                  border: 4px solid rgba(255, 255, 255, 0.3);
                  border-top: 4px solid #3498db;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  animation: spin 1s linear infinite;
                  margin-bottom: 10px;
              }
              @keyframes spin {
                  0% {
                      transform: rotate(0deg);
                  }
                  100% {
                      transform: rotate(360deg);
                  }
              }
              .loading-text {
                  color: black; /* Change to match your design */
                  font-size: 16px;
                  text-align: center;
              }
          `}</style>
        </>
    )
}

export { LoadingSpinner, InlineLoadingSpinner }
