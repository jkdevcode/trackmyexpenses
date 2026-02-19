import { Spinner } from "@heroui/spinner";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = "Cargando..." }: LoadingSpinnerProps) => {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-default-200 bg-content1/80 backdrop-blur px-6 py-8 shadow-lg">
        <div className="flex items-center justify-center">
          <Spinner color="primary" size="lg" />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-default-600">{message}</p>
      </div>
    </div>
  );
};
