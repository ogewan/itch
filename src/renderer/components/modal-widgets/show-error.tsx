import React from "react";

import { ModalWidgetDiv } from "./modal-widget";

import styled from "../styles";
import Log from "../basics/log";
import { IModalWidgetProps } from "./index";
import { size } from "underscore";
import {
  getErrorStack,
  isInternalError,
  getRpcErrorData,
} from "common/butlerd";
import classNames from "classnames";
import { T } from "renderer/t";
import Cover from "../basics/cover";
import { Game } from "common/butlerd/messages";
import Link from "../basics/link";
import { actionCreatorsList, Dispatchers, connect } from "../connect";

const StyledLog = styled(Log)`
  tbody {
    min-height: 180px;
  }

  padding-bottom: 1em;
`;

const Pre = styled.pre`
  max-height: 10em;
  overflow-y: scroll;
  background: ${props => props.theme.sidebarBackground};
  padding: 1em;
  line-height: 1.4;
  margin-bottom: 1em;
  white-space: pre-wrap;
`;

const ContainerDiv = styled.div`
  details {
    padding-left: 1em;

    summary {
      color: ${props => props.theme.secondaryText};
      margin-left: -1em;
      margin-bottom: 1em;
      padding: 0.2m;

      &:active,
      &:focus {
        outline: 0;
      }

      &:hover {
        cursor: pointer;
      }
    }
  }

  p.butler-version {
    color: ${props => props.theme.secondaryText};
  }
`;

const ReportLabel = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;

  input[type="checkbox"] {
    display: block;
    margin-left: 0;
    margin-right: 6px;
  }

  &:hover {
    cursor: pointer;
  }

  transition: color 0.4s;
  color: ${props => props.theme.secondaryText};

  &:not(.enabled) {
    color: ${props => props.theme.ternaryText};
  }
`;

const GameRow = styled.div`
  margin: 5px 20px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;

  background: rgba(0, 0, 0, 0.2);

  .cover-container {
    width: 32px;
    margin-right: 10px;
  }
`;

class ShowError extends React.PureComponent<IProps & IDerivedProps, IState> {
  constructor(props: ShowError["props"], context: any) {
    super(props, context);
    this.state = {
      // TODO: save to prefs
      sendReport: true,
    };
  }

  render() {
    return (
      <>
        {this.renderGameStuff()}
        {this.renderErrorStuff()}
      </>
    );
  }

  renderGameStuff() {
    const { game } = this.props.modal.widgetParams;
    if (!game) {
      return null;
    }

    const { stillCoverUrl, coverUrl, id, title } = game;
    return (
      <GameRow>
        <div className="cover-container">
          <Cover
            stillCoverUrl={stillCoverUrl}
            coverUrl={coverUrl}
            gameId={id}
          />
        </div>
        <Link onClick={this.onClickGame} label={title} />
      </GameRow>
    );
  }

  renderErrorStuff() {
    const { rawError, log, forceDetails } = this.props.modal.widgetParams;
    const internal = isInternalError(rawError);
    if (!internal && !forceDetails) {
      return null;
    }
    const ed = getRpcErrorData(rawError);

    const errorStack = getErrorStack(rawError);
    const errorLines = (errorStack || "Unknown error").split("\n");
    return (
      <ModalWidgetDiv>
        <ContainerDiv>
          <details>
            <summary>{T(["prompt.show_error.details_for_nerds"])}</summary>
            <details open>
              <summary>
                {T(["prompt.show_error.details_for_nerds.event_log"])}
              </summary>
              <StyledLog log={log} />
              {ed && ed.butlerVersion ? (
                <p className="butler-version">
                  butler version: {ed.butlerVersion}
                </p>
              ) : null}
            </details>
            {size(errorLines) == 1 ? null : (
              <details>
                <summary>
                  {T(["prompt.show_error.details_for_nerds.stack_trace"])}
                </summary>
                <Pre>
                  {ed && ed.butlerVersion ? `For: ${ed.butlerVersion}\n` : ""}
                  {errorLines.slice(1).join("\n")}
                </Pre>
              </details>
            )}
          </details>
        </ContainerDiv>
        <ReportLabel className={classNames({ enabled: this.state.sendReport })}>
          <input
            type="checkbox"
            checked={this.state.sendReport}
            onChange={this.onSendReportChange}
          />
          {T(["prompt.show_error.send_report"])}
        </ReportLabel>
      </ModalWidgetDiv>
    );
  }

  onClickGame = () => {
    const { openInExternalBrowser } = this.props;
    const { game } = this.props.modal.widgetParams;
    if (!game) {
      return;
    }
    openInExternalBrowser({ url: game.url });
  };

  onSendReportChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      sendReport: ev.currentTarget.checked,
    });
  };
}

export interface IShowErrorParams {
  rawError: any;
  game?: Game;
  log: string;
  forceDetails?: boolean;
}

interface IProps extends IModalWidgetProps<IShowErrorParams, void> {}

interface IState {
  sendReport: boolean;
}

const actionCreators = actionCreatorsList("openInExternalBrowser");

type IDerivedProps = Dispatchers<typeof actionCreators>;

export default connect<IProps>(ShowError, { actionCreators });
