import type React from "react";
import { Component } from "react";
import { Button } from "@heroui/button";

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("UI runtime error:", error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-xl font-semibold">{this.props.fallbackTitle ?? "Ocurrio un error inesperado"}</h2>
          <p className="text-default-500 max-w-xl">
            Esta seccion fallo. Puedes intentar recargar la vista.
          </p>
          <Button color="primary" onPress={this.handleRetry}>
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
