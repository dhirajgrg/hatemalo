export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-surface rounded-xl border border-border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`px-6 py-4 border-t border-border bg-surface-alt rounded-b-xl ${className}`}
    >
      {children}
    </div>
  );
};
