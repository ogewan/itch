import * as React from "react";

import { IModalWidgetProps } from "./modal-widget";

import { getInjectPath } from "../../os/resources";
import { connect, Dispatchers, actionCreatorsList } from "../connect";
import { actions } from "../../actions/index";

class RecaptchaInput extends React.Component<
  IRecaptchaInputProps & IDerivedProps
> {
  webview: Electron.WebviewTag;
  checker: NodeJS.Timer;

  constructor() {
    super();
    this.gotWebview = this.gotWebview.bind(this);
  }

  render() {
    const params = this.props.modal.widgetParams as IRecaptchaInputParams;
    const { url } = params;

    return (
      <div className="modal-widget">
        <webview
          ref={this.gotWebview}
          src={url}
          style={{ minHeight: "500px" }}
          preload={getInjectPath("captcha")}
        />
      </div>
    );
  }

  gotWebview(wv: Electron.WebviewTag) {
    this.webview = wv;
    this.clearChecker();

    if (!this.webview) {
      return;
    }

    this.checker = setInterval(() => {
      this.webview.executeJavaScript(
        `window.captchaResponse`,
        false,
        (response: string | undefined) => {
          if (response) {
            this.props.closeModal({
              action: actions.modalResponse({
                recaptchaResponse: response,
              }),
            });
          }
        }
      );
    }, 500);
  }

  componentWillUnmount() {
    this.clearChecker();
  }

  clearChecker() {
    if (this.checker) {
      clearInterval(this.checker);
      this.checker = null;
    }
  }
}

export interface IRecaptchaInputParams {
  url: string;
}

interface IRecaptchaInputProps extends IModalWidgetProps {
  params: IRecaptchaInputParams;
}

const actionCreators = actionCreatorsList("closeModal");

type IDerivedProps = Dispatchers<typeof actionCreators>;

export default connect<IRecaptchaInputProps>(RecaptchaInput, {
  actionCreators,
});
