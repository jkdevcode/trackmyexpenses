import type React from "react";

import { Component } from "react";
import { Button } from "@heroui/button";
import { type WithTranslation, withTranslation } from "react-i18next";

import { ColorThemeContext } from "@/contexts/color-theme";

interface Props extends WithTranslation {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

class AppErrorBoundaryBase extends Component<Props, State> {
  static contextType = ColorThemeContext;
  declare context: React.ContextType<typeof ColorThemeContext>;

  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: unknown) {
    // Reserved for error reporting integration (Sentry, Datadog, etc.)
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { t } = this.props;
    const { appColor } = this.context;

    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-xl font-semibold">
            {this.props.fallbackTitle ?? t("common:error_boundary.title")}
          </h2>
          <p className="text-default-500 max-w-xl">
            {t("common:error_boundary.description")}
          </p>
          <Button color={appColor} onPress={this.handleRetry}>
            {t("common:error_boundary.retry")}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppErrorBoundary = withTranslation("common")(AppErrorBoundaryBase);

export default AppErrorBoundary;
