const STAGES = ['Order Received','In Kitchen ','Sent to Delivery'];

const StatusTracker = ({ status }) => {
  const currentIndex = STAGES.indexOf(status);
  if (status === 'Cancelled') {
    return <div style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Cancelled</div>;
  }
  return (
    <div className="step-tracker">
      {STAGES.map((stage, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isDone = idx <= currentIndex;
        return (
          <div key={stage} className="step-tracker-item">
            <div className="step-tracker-node">
              <div className={`step-circle ${isDone ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`step-label ${isDone ? 'active' : ''}`}>{stage}</span>
            </div>
            {idx < STAGES.length - 1 && <div className={`step-line ${isCompleted ? 'active' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;