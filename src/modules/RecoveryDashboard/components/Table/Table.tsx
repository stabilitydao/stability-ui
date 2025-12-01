import { ReactNode } from "react";

// Table Wrapper Component
interface TableProps {
  children: ReactNode;
  minWidth?: string;
}

export function Table({ children, minWidth = "600px" }: TableProps) {
  return (
    <div className="bg-[#101012] border border-[#23252A] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </div>
  );
}

// TableHeader Component
interface TableHeaderProps {
  children: ReactNode;
  gridColumns: string;
}

export function TableHeader({ children, gridColumns }: TableHeaderProps) {
  return (
    <div
      className="grid gap-4 px-6 py-3 bg-[#151618] border-b border-[#23252A] text-[#97979A] text-sm font-semibold"
      style={{ gridTemplateColumns: gridColumns }}
    >
      {children}
    </div>
  );
}

// TableRow Component
interface TableRowProps {
  children: ReactNode;
  gridColumns: string;
  onClick?: () => void;
}

export function TableRow({ children, gridColumns, onClick }: TableRowProps) {
  return (
    <div
      className="grid gap-4 px-6 py-4 border-b border-[#23252A] last:border-b-0 hover:bg-gray-800/50 lg:bg-transparent transition-colors items-center"
      style={{ gridTemplateColumns: gridColumns }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// TableBody Component
interface TableBodyProps {
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function TableBody({
  children,
  emptyMessage,
  isEmpty = false,
}: TableBodyProps) {
  if (isEmpty) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-500 text-sm">
          {emptyMessage || "No data available"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
